# Copyright 2015 gRPC authors.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
"""The Python implementation of the GRPC capture.Greeter server."""

from concurrent import futures
import logging

import grpc
import capture_pb2
import capture_pb2_grpc

from PIL import ImageGrab
from pathlib import Path
import os

class Greeter(capture_pb2_grpc.GreeterServicer):
    def SayHello(self, request, context):
        print('测试数据111')
        return capture_pb2.HelloReply(message="Hello, %s!" % request.name)
    
    def CaptureDesktop(self, request, context):
        left = request.x
        top = request.y
        width = request.width
        height = request.height
        right = left + width
        bottom = top + height
        tartget = request.target

        print(left, top, right, bottom,'???[[[]]]')
        current_dir = Path.cwd()
        # print(current_dir)
        if left == 0 and top == 0 and right == 0 and bottom == 0:
            # 获取屏幕尺寸
            width, height = ImageGrab.grab().size
            right = width
            bottom = height
        # 截取整个屏幕
        screenshot = ImageGrab.grab(bbox=(left, top, right, bottom))

        # 保存截图到文件
        screenshot.save(tartget)
        # file = os.path.join(current_dir, tartget)
        return capture_pb2.CaptureReply(file=tartget)

def serve():
    port = "50051"
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    capture_pb2_grpc.add_GreeterServicer_to_server(Greeter(), server)
    server.add_insecure_port("[::]:" + port)
    server.start()
    print("Server started, listening on " + port)
    server.wait_for_termination()


if __name__ == "__main__":
    # logging.basicConfig()
    serve()
