import os
import torch
from torchvision import datasets, transforms
from torch.utils.data import DataLoader

def get_data_transforms():
    # Chuẩn hóa theo chuẩn ImageNet vì chúng ta sử dụng Transfer Learning với MobileNetV2 pre-trained
    mean = [0.485, 0.456, 0.406]
    std = [0.229, 0.224, 0.225]
    
    train_transform = transforms.Compose([
        transforms.Resize((112, 112)),  # Resize lên 112x112 phù hợp MobileNetV2 và nhanh hơn 224x224
        transforms.RandomHorizontalFlip(),  # Lật ngang ảnh ngẫu nhiên
        transforms.RandomRotation(15),  # Xoay ảnh ngẫu nhiên tối đa 15 độ
        transforms.ColorJitter(brightness=0.2, contrast=0.2),  # Tự động tăng giảm độ sáng/tương phản nhẹ
        transforms.ToTensor(),
        transforms.Normalize(mean, std)
    ])
    
    test_transform = transforms.Compose([
        transforms.Resize((112, 112)),
        transforms.ToTensor(),
        transforms.Normalize(mean, std)
    ])
    
    return train_transform, test_transform

def get_dataloaders(dataset_dir, batch_size=64):
    train_dir = os.path.join(dataset_dir, "train")
    test_dir = os.path.join(dataset_dir, "test")
    
    train_transform, test_transform = get_data_transforms()
    
    # ImageFolder tự động đọc các thư mục con làm nhãn phân loại
    train_dataset = datasets.ImageFolder(train_dir, transform=train_transform)
    test_dataset = datasets.ImageFolder(test_dir, transform=test_transform)
    
    train_loader = DataLoader(
        train_dataset, 
        batch_size=batch_size, 
        shuffle=True, 
        num_workers=2, 
        pin_memory=True if torch.cuda.is_available() else False
    )
    
    test_loader = DataLoader(
        test_dataset, 
        batch_size=batch_size, 
        shuffle=False, 
        num_workers=2,
        pin_memory=True if torch.cuda.is_available() else False
    )
    
    return train_loader, test_loader, train_dataset.classes

def main():
    print("=== STAGE 2: KIỂM TRA PIPELINE DỮ LIỆU ===")
    current_dir = os.path.dirname(os.path.abspath(__file__))
    dataset_dir = os.path.join(current_dir, "dataset")
    
    if not os.path.exists(dataset_dir):
        print(f"LỖI: Chưa tìm thấy thư mục dataset tại {dataset_dir}. Vui lòng chạy Stage 1 trước.")
        return
        
    try:
        train_loader, test_loader, classes = get_dataloaders(dataset_dir, batch_size=64)
        print(f"Đã nạp thành công bộ dữ liệu!")
        print(f"Danh sách các lớp cảm xúc ({len(classes)} lớp): {classes}")
        print(f"Số lượng ảnh tập Train: {len(train_loader.dataset)}")
        print(f"Số lượng ảnh tập Test/Val: {len(test_loader.dataset)}")
        
        # Lấy thử 1 batch để kiểm tra kích thước
        images, labels = next(iter(train_loader))
        print(f"Kích thước một lô ảnh (Batch Shape): {images.shape}")
        print(f"Kích thước một lô nhãn (Labels Shape): {labels.shape}")
        print("=== STAGE 2 HOÀN THÀNH ===")
    except Exception as e:
        print(f"Lỗi khi kiểm tra dữ liệu: {e}")

if __name__ == "__main__":
    main()
