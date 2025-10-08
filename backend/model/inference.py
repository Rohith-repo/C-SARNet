# backend/model/inference.py
import torch
import torch.nn as nn
import torchvision.transforms as transforms
from PIL import Image
from .architecture import Generator  # This should work now
import io
import base64

class SARColorizer:
    def __init__(self, checkpoint_path="model/checkpoint_epoch_200.pth"):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        
        # ✅ Use Generator which is an alias for UnetGenerator
        self.model = Generator(c_in=1, c_out=3)
        
        checkpoint = torch.load(checkpoint_path, map_location=self.device)
        self.model.load_state_dict(checkpoint["generator_state_dict"])
        self.model.eval()
        self.model.to(self.device)
    
    def preprocess_image(self, image):
        transform = transforms.Compose([
            transforms.Grayscale(num_output_channels=1),
            transforms.Resize((256, 256)),
            transforms.ToTensor(),
            transforms.Normalize((0.5,), (0.5,))
        ])
        return transform(image).unsqueeze(0).to(self.device)
    
    def image_to_base64(self, image):
        buffered = io.BytesIO()
        image.save(buffered, format="PNG")
        return base64.b64encode(buffered.getvalue()).decode()
    
    def colorize(self, image_file):
        image = Image.open(image_file).convert("L")
        input_tensor = self.preprocess_image(image)
        
        with torch.no_grad():
            output_tensor = self.model(input_tensor)
        
        output_tensor = (output_tensor.squeeze(0).cpu() * 0.5 + 0.5).clamp(0, 1)
        output_image = transforms.ToPILImage()(output_tensor)
        
        return self.image_to_base64(output_image)