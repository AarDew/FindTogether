# Model Download Instructions

To enable real AI face matching, download these ONNX models:

## 1. RetinaFace (Face Detection)
- Download: `retinaface_resnet50_v1.onnx`
- From: https://github.com/onnx/models/tree/main/vision/body_analysis/face_detection/retinaface
- Place in: `/public/models/retinaface/retinaface_resnet50_v1.onnx`

## 2. ArcFace (Face Recognition)  
- Download: `arcface_r100_v1.onnx`
- From: https://github.com/onnx/models/tree/main/vision/body_analysis/arcface
- Place in: `/public/models/arcface/arcface_r100_v1.onnx`

## 3. ESRGAN (Super Resolution) - Optional
- Download: `esrgan_x4plus.onnx` 
- From: https://github.com/onnx/models/tree/main/vision/super_resolution/sub_pixel_cnn_2016
- Place in: `/public/models/esrgan/esrgan_x4plus.onnx`

## Commands to Download:
```bash
# RetinaFace
curl -L "https://github.com/onnx/models/raw/main/vision/body_analysis/face_detection/retinaface/model/retinaface_resnet50_v1.onnx" -o public/models/retinaface/retinaface_resnet50_v1.onnx

# ArcFace  
curl -L "https://github.com/onnx/models/raw/main/vision/body_analysis/arcface/model/arcface_r100_v1.onnx" -o public/models/arcface/arcface_r100_v1.onnx
```

**Note**: The AI pipeline will fallback to mock processing if models are not found, so the app will work even without models downloaded.