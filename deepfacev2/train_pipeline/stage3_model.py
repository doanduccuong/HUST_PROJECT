import torch
import torch.nn as nn
import torchvision.models as models

def get_emotion_model(num_classes=7):
    """
    Khởi tạo mô hình MobileNetV2 với weights đã được pre-trained trên ImageNet,
    sau đó thay đổi layer phân loại cuối cùng (classifier head) để phù hợp với số lượng lớp cảm xúc.
    """
    try:
        # Cách load weights chuẩn của torchvision phiên bản mới
        from torchvision.models import MobileNet_V2_Weights
        model = models.mobilenet_v2(weights=MobileNet_V2_Weights.DEFAULT)
        print("Đã tải thành công Backbone MobileNetV2 (ImageNet weights).")
    except (ImportError, TypeError):
        # Fallback cho torchvision phiên bản cũ hơn
        model = models.mobilenet_v2(pretrained=True)
        print("Đã tải thành công Backbone MobileNetV2 pre-trained (cú pháp cũ).")
        
    # Thay thế phần đầu phân loại (classifier)
    # Cấu trúc gốc của model.classifier là:
    # nn.Sequential(nn.Dropout(p=0.2), nn.Linear(in_features=1280, out_features=1000))
    in_features = model.classifier[1].in_features
    model.classifier[1] = nn.Linear(in_features, num_classes)
    print(f"Đã thay đổi Fully Connected layer cuối: Linear(in_features={in_features}, out_features={num_classes})")
    
    return model

def main():
    print("=== STAGE 3: KIỂM TRA KIẾN TRÚC MÔ HÌNH ===")
    
    # 7 lớp tương ứng với FER2013
    num_classes = 7
    model = get_emotion_model(num_classes=num_classes)
    
    # Kiểm tra kích thước output của mô hình với input giả lập (dummy tensor)
    # Batch size = 1, 3 kênh màu, kích thước 112x112
    dummy_input = torch.randn(1, 3, 112, 112)
    
    # Chuyển mô hình về trạng thái evaluation để kiểm tra forward pass
    model.eval()
    with torch.no_grad():
        output = model(dummy_input)
        
    print(f"Kích thước tensor đầu vào giả lập: {dummy_input.shape}")
    print(f"Kích thước tensor đầu ra dự đoán: {output.shape}")
    
    if output.shape == (1, num_classes):
        print("Kiểm tra forward pass thành công! Kích thước đầu ra hoàn toàn chính xác.")
        print("=== STAGE 3 HOÀN THÀNH ===")
    else:
        print(f"CẢNH BÁO: Kích thước đầu ra không khớp, nhận được {output.shape}")

if __name__ == "__main__":
    main()
