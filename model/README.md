# Model - SAR Image Colorization

Deep learning model implementation using Pix2Pix GAN with U-Net generator and PatchGAN discriminator for SAR image colorization.

## 🎯 Architecture

### Generator: U-Net

* Encoder-decoder architecture with skip connections
* Downsampling: Convolutional layers with batch normalization
* Upsampling: Transposed convolutions
* Input: (1, 256, 256, 3) - Grayscale SAR image
* Output: (1, 256, 256, 3) - Colorized RGB image

### Discriminator: PatchGAN

* Operates on N × N patches instead of full images
* Focuses on local features for better detail generation
* Binary classification: Real vs Generated

## 📊 Loss Functions

* **L1 Loss**: Pixel-wise absolute error for structural similarity
* **Perceptual Loss**: Feature map difference using pretrained VGG-16
* **Adversarial Loss**: Binary cross-entropy to fool discriminator
* **MSE Loss**: Used in Denoising Autoencoder for refinement

## 🚀 Training Setup

### Hardware

* **GPU**: NVIDIA DGX A100 (200GB)
* **Framework**: PyTorch 2.0+

### Hyperparameters

* **Optimizer**: Adam
  * Generator: LR = 0.0002, β₁ = 0.005, β₂ = 0.99
  * Discriminator: LR = 0.0002, β₁ = 0.5, β₂ = 0.999
  * Autoencoder: LR = 0.001
* **Batch Size**: 16
* **Epochs**: 200
* **Image Size**: 256 × 256

## 📁 Project Structure

```
model/
├── train.py                      # Training script
├── inference.py                  # Inference script
├── app.py                        # Flask/FastAPI app for serving
├── utils/
│   ├── DenoisingAutoEncoder.py   # Denoising autoencoder
│   ├── LabDataset.py             # Custom dataset loader
│   └── Pairing_Images.py         # SAR-Optical pairing utility
├── checkpoints/                  # Saved model weights
├── logs/                         # Training logs
└── requirements.txt
```

## 🛠️ Installation

```bash
# Install dependencies
pip install -r requirements.txt

# For GPU support, ensure CUDA is installed
```

## 📝 Usage

### Training

```bash
python train.py \
    --data_path /path/to/dataset \
    --epochs 200 \
    --batch_size 16 \
    --save_dir checkpoints/
```

### Inference

```bash
python inference.py \
    --model_path checkpoints/best_model.pth \
    --input_image path/to/sar_image.png \
    --output_dir results/
```

### Load Model in Python

```python
from utils import load_model, colorize_image
from PIL import Image

# Load trained model
model = load_model('checkpoints/best_model.pth')

# Load SAR image
sar_image = Image.open('path/to/sar_image.png')

# Colorize
colorized = colorize_image(model, sar_image)
colorized.save('output.png')
```

## 📊 Dataset Preparation

### Expected Structure

```
dataset/
├── train/
│   ├── SAR/          # Grayscale SAR images
│   └── Optical/      # Corresponding color images
└── test/
    ├── SAR/
    └── Optical/
```

### Pairing SAR and Optical Images

```bash
python utils/Pairing_Images.py \
    --sar_dir dataset/SAR \
    --optical_dir dataset/Optical \
    --output_dir dataset/paired
```

## 🏆 Performance Metrics


| Metric   | Value    |
| -------- | -------- |
| **SSIM** | 0.97     |
| **PSNR** | 27.42 dB |
| **MSE**  | 0.0021   |

## 🔧 Key Scripts

### `train.py`

* Loads paired SAR-Optical dataset
* Trains Pix2Pix GAN with custom loss functions
* Saves checkpoints and logs training metrics

### `inference.py`

* Loads trained model
* Performs colorization on new SAR images
* Saves results with comparison visualizations

### `utils/DenoisingAutoEncoder.py`

* Implements denoising autoencoder for preprocessing
* Reduces noise in SAR images before colorization

### `utils/LabDataset.py`

* Custom PyTorch dataset for loading SAR-Optical pairs
* Handles data augmentation and preprocessing

### `utils/Pairing_Images.py`

* Matches SAR images with corresponding optical images
* Validates dataset integrity

## 📦 Dependencies

```
torch>=2.0.0
torchvision>=0.15.0
Pillow>=9.0.0
numpy>=1.23.0
scikit-image>=0.19.0
matplotlib>=3.5.0
tqdm>=4.64.0
```

## 🧪 Testing

```bash
# Test on sample images
python test.py --test_dir dataset/test

# Evaluate metrics
python evaluate.py --model_path checkpoints/best_model.pth
```

## 📈 Training Tips

1. **Data Augmentation**: Use random flips, rotations for better generalization
2. **Learning Rate Scheduling**: Reduce LR by 0.5 every 50 epochs
3. **Checkpointing**: Save model every 10 epochs
4. **Validation**: Monitor SSIM and PSNR on validation set
5. **Early Stopping**: Stop if validation loss doesn't improve for 20 epochs

## 🔍 Troubleshooting

**Out of Memory Error**

* Reduce batch size
* Use gradient accumulation
* Enable mixed precision training

**Poor Colorization Quality**

* Increase training epochs
* Check dataset quality and pairing
* Adjust perceptual loss weight

**Slow Training**

* Verify GPU utilization
* Use DataLoader with multiple workers
* Enable CUDA benchmarking

## 📄 License

MIT License - see root LICENSE file for details

## 📚 References

* Pix2Pix: Image-to-Image Translation with Conditional GANs
* U-Net: Convolutional Networks for Biomedical Image Segmentation
* Perceptual Loss: Perceptual Losses for Real-Time Style Transfer
