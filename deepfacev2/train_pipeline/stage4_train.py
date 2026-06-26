import os
import time
import torch
import torch.nn as nn
import torch.optim as optim
import matplotlib.pyplot as plt

# Import các hàm từ Stage 2 và Stage 3
from stage2_prep import get_dataloaders
from stage3_model import get_emotion_model

# Cấu hình huấn luyện
BATCH_SIZE = 64
LEARNING_RATE = 0.0005  # Learning rate nhỏ để fine-tune mô hình đã pre-trained
EPOCHS = 10  # Chạy thử nghiệm 10 epoch (người dùng có thể tăng lên 30-50 để đạt độ chính xác cao hơn)

def train_one_epoch(model, dataloader, criterion, optimizer, device):
    model.train()
    running_loss = 0.0
    correct = 0
    total = 0
    
    for i, (images, labels) in enumerate(dataloader):
        images, labels = images.to(device), labels.to(device)
        
        # Forward pass
        outputs = model(images)
        loss = criterion(outputs, labels)
        
        # Backward pass và tối ưu hóa
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()
        
        running_loss += loss.item() * images.size(0)
        _, predicted = outputs.max(1)
        total += labels.size(0)
        correct += predicted.eq(labels).sum().item()
        
        if (i + 1) % 50 == 0:
            print(f"    [Batch {i+1}/{len(dataloader)}] Loss: {loss.item():.4f} | Acc: {100.0 * correct / total:.2f}%")
            
    epoch_loss = running_loss / len(dataloader.dataset)
    epoch_acc = 100.0 * correct / total
    return epoch_loss, epoch_acc

def validate(model, dataloader, criterion, device):
    model.eval()
    running_loss = 0.0
    correct = 0
    total = 0
    
    with torch.no_grad():
        for images, labels in dataloader:
            images, labels = images.to(device), labels.to(device)
            outputs = model(images)
            loss = criterion(outputs, labels)
            
            running_loss += loss.item() * images.size(0)
            _, predicted = outputs.max(1)
            total += labels.size(0)
            correct += predicted.eq(labels).sum().item()
            
    val_loss = running_loss / len(dataloader.dataset)
    val_acc = 100.0 * correct / total
    return val_loss, val_acc

def plot_history(history, save_path):
    epochs = range(1, len(history['train_loss']) + 1)
    
    plt.figure(figsize=(12, 5))
    
    # Biểu đồ Loss
    plt.subplot(1, 2, 1)
    plt.plot(epochs, history['train_loss'], 'b-', label='Train Loss')
    plt.plot(epochs, history['val_loss'], 'r-', label='Val Loss')
    plt.title('Training & Validation Loss')
    plt.xlabel('Epochs')
    plt.ylabel('Loss')
    plt.legend()
    
    # Biểu đồ Accuracy
    plt.subplot(1, 2, 2)
    plt.plot(epochs, history['train_acc'], 'b-', label='Train Acc')
    plt.plot(epochs, history['val_acc'], 'r-', label='Val Acc')
    plt.title('Training & Validation Accuracy')
    plt.xlabel('Epochs')
    plt.ylabel('Accuracy (%)')
    plt.legend()
    
    plt.tight_layout()
    plt.savefig(save_path)
    plt.close()
    print(f"Đã lưu biểu đồ huấn luyện tại: {save_path}")

def main():
    print("=== STAGE 4: BẮT ĐẦU HUẤN LUYỆN MÔ HÌNH ===")
    
    # 1. Xác định thiết bị tính toán (Device)
    if torch.cuda.is_available():
        device = torch.device("cuda")
        print("Sử dụng GPU NVIDIA CUDA để huấn luyện.")
    elif torch.backends.mps.is_available():
        # MPS tăng tốc đồ họa/máy học trên Apple Silicon Mac
        device = torch.device("mps")
        print("Sử dụng Apple Silicon GPU (MPS) để huấn luyện.")
    else:
        device = torch.device("cpu")
        print("Sử dụng CPU để huấn luyện (Tốc độ sẽ chậm hơn).")
        
    # 2. Chuẩn bị dữ liệu
    current_dir = os.path.dirname(os.path.abspath(__file__))
    dataset_dir = os.path.join(current_dir, "dataset")
    
    if not os.path.exists(dataset_dir):
        print("LỖI: Chưa có dữ liệu. Vui lòng chạy Stage 1 để tải dữ liệu.")
        return
        
    print("Đang khởi tạo DataLoaders...")
    train_loader, test_loader, classes = get_dataloaders(dataset_dir, batch_size=BATCH_SIZE)
    
    # 3. Khởi tạo mô hình
    model = get_emotion_model(num_classes=len(classes))
    model = model.to(device)
    
    # 4. Thiết lập Loss và Optimizer
    criterion = nn.CrossEntropyLoss()
    # Optimizer chỉ tối ưu hóa các tham số của model
    optimizer = optim.Adam(model.parameters(), lr=LEARNING_RATE)
    
    # Lịch sử lưu thông số
    history = {
        'train_loss': [], 'train_acc': [],
        'val_loss': [], 'val_acc': []
    }
    
    best_acc = 0.0
    start_time = time.time()
    
    # 5. Vòng lặp huấn luyện chính (Training Loop)
    for epoch in range(EPOCHS):
        print(f"\n--- Epoch {epoch+1}/{EPOCHS} ---")
        epoch_start = time.time()
        
        train_loss, train_acc = train_one_epoch(model, train_loader, criterion, optimizer, device)
        val_loss, val_acc = validate(model, test_loader, criterion, device)
        
        # Ghi log lịch sử
        history['train_loss'].append(train_loss)
        history['train_acc'].append(train_acc)
        history['val_loss'].append(val_loss)
        history['val_acc'].append(val_acc)
        
        epoch_time = time.time() - epoch_start
        print(f"Epoch {epoch+1} kết thúc trong {epoch_time:.2f}s | "
              f"Train Loss: {train_loss:.4f} - Train Acc: {train_acc:.2f}% | "
              f"Val Loss: {val_loss:.4f} - Val Acc: {val_acc:.2f}%")
              
        # Lưu checkpoint mô hình tốt nhất
        if val_acc > best_acc:
            best_acc = val_acc
            checkpoint_path = os.path.join(current_dir, "best_emotion_model.pth")
            torch.save(model.state_dict(), checkpoint_path)
            print(f"==> Đã lưu mô hình tốt nhất mới ({best_acc:.2f}%) tại: {checkpoint_path}")
            
    total_time = time.time() - start_time
    print(f"\nHUẤN LUYỆN HOÀN THÀNH trong {total_time/60:.2f} phút.")
    print(f"Độ chính xác tốt nhất trên tập Validation: {best_acc:.2f}%")
    
    # 6. Vẽ biểu đồ Loss & Accuracy
    chart_path = os.path.join(current_dir, "training_history.png")
    plot_history(history, chart_path)
    print("=== STAGE 4 HOÀN THÀNH ===")

if __name__ == "__main__":
    main()
