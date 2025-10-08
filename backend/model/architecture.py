# backend/model/architecture.py (or __init__.py if architecture is a folder)
import torch
import torch.nn as nn
import torch.nn.functional as F

class DownsamplingBlock(nn.Module):
    def __init__(self, c_in, c_out, kernel_size=4, stride=2, padding=1, negative_slope=0.2, use_norm=True):
        super(DownsamplingBlock, self).__init__()
        self.conv_block = nn.ModuleDict()
        self.conv_block['conv'] = nn.Conv2d(c_in, c_out, kernel_size, stride, padding, bias=True)
        if use_norm:
            self.conv_block['bn'] = nn.BatchNorm2d(c_out)
        self.conv_block['act'] = nn.LeakyReLU(negative_slope)

    def forward(self, x):
        x = self.conv_block['conv'](x)
        if 'bn' in self.conv_block:
            x = self.conv_block['bn'](x)
        x = self.conv_block['act'](x)
        return x

class UpsamplingBlock(nn.Module):
    def __init__(self, c_in, c_out, kernel_size=4, stride=2, padding=1, use_dropout=False):
        super(UpsamplingBlock, self).__init__()
        self.conv_block = nn.ModuleDict()
        self.conv_block['conv'] = nn.ConvTranspose2d(c_in, c_out, kernel_size, stride, padding, bias=True)
        self.conv_block['bn'] = nn.BatchNorm2d(c_out)
        if use_dropout:
            self.conv_block['dropout'] = nn.Dropout(0.5)
        self.conv_block['act'] = nn.ReLU(True)

    def forward(self, x):
        x = self.conv_block['conv'](x)
        x = self.conv_block['bn'](x)
        if 'dropout' in self.conv_block:
            x = self.conv_block['dropout'](x)
        x = self.conv_block['act'](x)
        return x

class UnetEncoder(nn.Module):
    def __init__(self, c_in=3, c_out=512):
        super(UnetEncoder, self).__init__()
        self.enc1 = DownsamplingBlock(c_in, 64, use_norm=False)
        self.enc2 = DownsamplingBlock(64, 128)
        self.enc3 = DownsamplingBlock(128, 256)
        self.enc4 = DownsamplingBlock(256, 512)
        self.enc5 = DownsamplingBlock(512, 512)
        self.enc6 = DownsamplingBlock(512, 512)
        self.enc7 = DownsamplingBlock(512, 512)
        self.enc8 = DownsamplingBlock(512, c_out)

    def forward(self, x):
        x1 = self.enc1(x)
        x2 = self.enc2(x1)
        x3 = self.enc3(x2)
        x4 = self.enc4(x3)
        x5 = self.enc5(x4)
        x6 = self.enc6(x5)
        x7 = self.enc7(x6)
        x8 = self.enc8(x7)
        return [x8, x7, x6, x5, x4, x3, x2, x1]

class UnetDecoder(nn.Module):
    def __init__(self, c_in=512, c_out=64, use_upsampling=False, mode='nearest'):
        super(UnetDecoder, self).__init__()
        self.dec1 = UpsamplingBlock(c_in, 512, use_dropout=True)
        self.dec2 = UpsamplingBlock(512*2, 512, use_dropout=True)
        self.dec3 = UpsamplingBlock(512*2, 512, use_dropout=True)
        self.dec4 = UpsamplingBlock(512*2, 512)
        self.dec5 = UpsamplingBlock(512*2, 256)
        self.dec6 = UpsamplingBlock(256*2, 128)
        self.dec7 = UpsamplingBlock(128*2, 64)
        self.dec8 = UpsamplingBlock(64*2, c_out)

    def forward(self, x):
        x9 = torch.cat([x[1], self.dec1(x[0])], 1)
        x10 = torch.cat([x[2], self.dec2(x9)], 1)
        x11 = torch.cat([x[3], self.dec3(x10)], 1)
        x12 = torch.cat([x[4], self.dec4(x11)], 1)
        x13 = torch.cat([x[5], self.dec5(x12)], 1)
        x14 = torch.cat([x[6], self.dec6(x13)], 1)
        x15 = torch.cat([x[7], self.dec7(x14)], 1)
        out = self.dec8(x15)
        return out

class UnetGenerator(nn.Module):
    def __init__(self, c_in=1, c_out=3):
        super(UnetGenerator, self).__init__()
        self.encoder = UnetEncoder(c_in=c_in)
        self.decoder = UnetDecoder()
        self.final = nn.Sequential(
            nn.Conv2d(64, c_out, 3, 1, padding=1, bias=True),
            nn.Tanh()
        )

    def forward(self, x):
        outE = self.encoder(x)
        outD = self.decoder(outE)
        out = self.final(outD)
        return out

# ✅ Create the alias - THIS IS CRITICAL
Generator = UnetGenerator