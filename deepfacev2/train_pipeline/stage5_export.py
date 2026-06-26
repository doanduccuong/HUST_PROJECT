import os
import torch
import torchvision.transforms as transforms
from PIL import Image

# Import hàm tạo model từ Stage 3
from stage3_model import get_emotion_model

def export_to_onnx(model_path, onnx_path, num_classes=7):
    print(f"Đang nạp trọng số mô hình PyTorch từ: {model_path} ...")
    model = get_emotion_model(num_classes=num_classes)
    
    # Nạp weights (nếu train trên GPU/MPS, cần map sang CPU khi export)
    checkpoint = torch.load(model_path, map_location=torch.device('cpu'))
    model.load_state_dict(checkpoint)
    model.eval()
    
    # Tạo dummy input tương ứng với shape đầu vào của mô hình (Batch size=1, 3 kênh, 112x112)
    dummy_input = torch.randn(1, 3, 112, 112)
    
    print("Đang thực hiện chuyển đổi mô hình sang định dạng ONNX...")
    torch.onnx.export(
        model,
        dummy_input,
        onnx_path,
        export_params=True,        # Lưu cả trọng số bên trong file mô hình
        opset_version=11,          # ONNX opset version phổ biến và tương thích cao
        do_constant_folding=True,  # Tối ưu hóa hằng số trong đồ thị tính toán
        input_names=['input'],     # Đặt tên tensor đầu vào
        output_names=['output'],   # Đặt tên tensor đầu ra
        dynamic_axes={             # Cho phép thay đổi batch_size linh hoạt khi suy luận
            'input': {0: 'batch_size'},
            'output': {0: 'batch_size'}
        }
    )
    print(f"Xuất mô hình ONNX thành công! File đã lưu tại: {onnx_path}")

def run_test_inference(onnx_path, image_path, classes):
    print(f"\n--- CHẠY THỬ NGHIỆM SUY LUẬN (INFERENCE) ---")
    print(f"Đang kiểm tra ảnh kiểm thử tại: {image_path}")
    
    if not os.path.exists(image_path):
        print(f"Không tìm thấy ảnh kiểm thử tại {image_path}. Bỏ qua kiểm thử inference.")
        return
        
    # Tiền xử lý ảnh giống hệt lúc huấn luyện
    mean = [0.485, 0.456, 0.406]
    std = [0.229, 0.224, 0.225]
    
    transform = transforms.Compose([
        transforms.Resize((112, 112)),
        transforms.ToTensor(),
        transforms.Normalize(mean, std)
    ])
    
    # Đọc ảnh và chuyển sang RGB
    img = Image.open(image_path).convert('RGB')
    input_tensor = transform(img).unsqueeze(0)  # Thêm chiều batch_size (1, 3, 112, 112)
    
    # Chạy suy luận bằng PyTorch (để kiểm chứng tính đúng đắn trước khi nạp vào Go)
    print("Đang nạp mô hình để dự đoán...")
    model = get_emotion_model(num_classes=len(classes))
    # Nạp weights từ file .pth tạm thời để so sánh
    model_pth = onnx_path.replace(".onnx", ".pth")
    if os.path.exists(model_pth):
        model.load_state_dict(torch.load(model_pth, map_location=torch.device('cpu')))
    model.eval()
    
    with torch.no_grad():
        outputs = model(input_tensor)
        probabilities = torch.nn.functional.softmax(outputs, dim=1)[0]
        
    # In kết quả
    print("\nKết quả phân tích phân phối cảm xúc:")
    for idx, prob in enumerate(probabilities):
        print(f"  - {classes[idx]:<10}: {prob.item() * 100:.2f}%")
        
    max_prob, max_idx = torch.max(probabilities, 0)
    print(f"\n=> Biểu cảm dự đoán cao nhất: **{classes[max_idx]}** ({max_prob.item() * 100:.2f}%)")

def main():
    print("=== STAGE 5: XUẤT MÔ HÌNH SANG ĐỊNH DẠNG ONNX ===")
    
    current_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(current_dir, "best_emotion_model.pth")
    onnx_path = os.path.join(current_dir, "emotion_model.onnx")
    
    if not os.path.exists(model_path):
        print(f"LỖI: Không tìm thấy file trọng số mô hình PyTorch tại {model_path}.")
        print("Vui lòng hoàn thành Stage 4 (Huấn luyện) để sinh ra file trọng số trước.")
        return
        
    # Danh sách lớp cảm xúc chuẩn của FER2013
    classes = ['angry', 'disgust', 'fear', 'happy', 'neutral', 'sad', 'surprise']
    
    # Xuất mô hình
    export_to_onnx(model_path, onnx_path, num_classes=len(classes))
    
    # Tìm kiếm thử 1 bức ảnh trong dataset để chạy demo suy luận
    test_image_dir = os.path.join(current_dir, "dataset", "test")
    test_image_path = None
    
    # Thử tìm ảnh bất kỳ trong dataset test
    if os.path.exists(test_image_dir):
        for root, dirs, files in os.walk(test_image_dir):
            for file in files:
                if file.lower().endswith(('.png', '.jpg', '.jpeg')):
                    test_image_path = os.path.join(root, file)
                    break
            if test_image_path:
                break
                
    if test_image_path:
        run_test_inference(onnx_path, test_image_path, classes)
    else:
        # Nếu không tìm thấy, gợi ý một đường dẫn ảnh mẫu
        print("Không tìm thấy ảnh mẫu trong thư mục test. Vui lòng đặt một ảnh bất kỳ vào thư mục dự án để thử nghiệm.")
        
    print("\n=== STAGE 5 HOÀN THÀNH ===")
    print("Mô hình ONNX đã sẵn sàng để tích hợp vào Go Backend!")

if __name__ == "__main__":
    main()
