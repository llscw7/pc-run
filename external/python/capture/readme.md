## 相关包
```
python -m pip install grpcio
python -m pip install grpcio-tools
pip install --upgrade Pillow
pip install pyinstaller
```

## 执行命令

```
python -m grpc_tools.protoc -I./ --python_out=. --pyi_out=. --grpc_python_out=. ./capture.proto
```
```
pyinstaller --onefile capture.py
```

## 文档
- https://grpc.io/docs/languages/python/quickstart/
- https://pillow.readthedocs.io/en/stable/reference/ImageGrab.html

## 备注
- macos上，无法对多屏幕进行截图
- macos上，图片清晰度较低
- 服务启动较慢，要个4、5秒