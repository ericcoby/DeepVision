"""
Training script for the optional CNN mode.

You do NOT need this to get the project working — the API runs out of the
box using model.py's frequency-heuristic mode. Use this script later if
your project needs better accuracy and you've obtained a labeled dataset
(FaceForensics++, Celeb-DF, or DFDC are the standard ones for this task).

Expected data layout:

  data/
    train/
      real/   *.jpg
      fake/   *.jpg
    val/
      real/   *.jpg
      fake/   *.jpg

If your dataset is video-based, extract frames first (e.g. with ffmpeg or
OpenCV) and dump them into these folders as individual face-cropped images.

Usage:
  pip install torch torchvision --break-system-packages
  python train.py --data_dir ./data --epochs 10

Output:
  Saves the trained weights to backend/weights/model.pt, which model.py
  will automatically detect and load on the next server restart.
"""

import argparse
import os

import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from torchvision import datasets, models, transforms


def build_dataloaders(data_dir, batch_size=32):
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.RandomHorizontalFlip(),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])
    val_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])

    train_ds = datasets.ImageFolder(os.path.join(data_dir, "train"), transform=transform)
    val_ds = datasets.ImageFolder(os.path.join(data_dir, "val"), transform=val_transform)

    # ImageFolder assigns labels alphabetically: fake=0, real=1.
    # We want label 1 = fake for a "higher score = more fake" convention,
    # so double check and flip if needed.
    print("Class mapping:", train_ds.class_to_idx)

    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True, num_workers=2)
    val_loader = DataLoader(val_ds, batch_size=batch_size, shuffle=False, num_workers=2)
    return train_loader, val_loader, train_ds.class_to_idx


def build_model():
    # ResNet18 pretrained on ImageNet, fine-tuned with a new binary head.
    # Swap for a bigger backbone (e.g. resnet50, efficientnet_b0) if you
    # have the compute and data to support it.
    net = models.resnet18(weights=models.ResNet18_Weights.IMAGENET1K_V1)
    net.fc = nn.Linear(net.fc.in_features, 1)
    return net


def train(data_dir, epochs, lr, batch_size, out_path):
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Training on {device}")

    train_loader, val_loader, class_to_idx = build_dataloaders(data_dir, batch_size)
    fake_idx = class_to_idx.get("fake", 0)

    net = build_model().to(device)
    criterion = nn.BCEWithLogitsLoss()
    optimizer = torch.optim.Adam(net.parameters(), lr=lr)

    best_val_acc = 0.0
    os.makedirs(os.path.dirname(out_path), exist_ok=True)

    for epoch in range(epochs):
        net.train()
        running_loss = 0.0
        for images, labels in train_loader:
            images = images.to(device)
            # Remap labels so 1 = fake, matching our score convention
            labels = (labels == fake_idx).float().unsqueeze(1).to(device)

            optimizer.zero_grad()
            outputs = net(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            running_loss += loss.item() * images.size(0)

        train_loss = running_loss / len(train_loader.dataset)

        # Validation
        net.eval()
        correct, total = 0, 0
        with torch.no_grad():
            for images, labels in val_loader:
                images = images.to(device)
                labels = (labels == fake_idx).float().unsqueeze(1).to(device)
                outputs = net(images)
                preds = (torch.sigmoid(outputs) >= 0.5).float()
                correct += (preds == labels).sum().item()
                total += labels.size(0)

        val_acc = correct / total if total else 0.0
        print(f"Epoch {epoch+1}/{epochs} — train_loss: {train_loss:.4f}  val_acc: {val_acc:.4f}")

        if val_acc > best_val_acc:
            best_val_acc = val_acc
            torch.save(net.state_dict(), out_path)
            print(f"  ↳ saved new best checkpoint to {out_path}")

    print(f"Done. Best val accuracy: {best_val_acc:.4f}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--data_dir", default="./data")
    parser.add_argument("--epochs", type=int, default=10)
    parser.add_argument("--lr", type=float, default=1e-4)
    parser.add_argument("--batch_size", type=int, default=32)
    parser.add_argument("--out", default="./weights/model.pt")
    args = parser.parse_args()

    train(args.data_dir, args.epochs, args.lr, args.batch_size, args.out)
