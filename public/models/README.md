# AI Models Directory

This directory contains pre-trained models for the face-matching pipeline:

## Directory Structure
```
/public/models/
├── esrgan/          # Super-resolution models
├── retinaface/      # Face detection models  
├── arcface/         # Face embedding models
└── weights/         # Additional model weights
```

## Model Downloads
To use the face-matching pipeline, download the following models:

### ESRGAN (Super Resolution)
- Download from: https://github.com/xinntao/ESRGAN
- Place models in `/public/models/esrgan/`

### RetinaFace (Face Detection)  
- Download from: https://github.com/biubug6/Pytorch_Retinaface
- Place models in `/public/models/retinaface/`

### ArcFace (Face Embeddings)
- Download from: https://github.com/deepinsight/insightface
- Place models in `/public/models/arcface/`

## Usage
Models are automatically loaded by the face-matching pipeline in the processFootage edge function.