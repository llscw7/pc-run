#include <iostream>
#include <Windows.h>
#include <filesystem>
void CaptureScreen(int screenId, int width, int height)
{
    // 获取屏幕设备上下文
    HDC hScreenDC = GetDC(NULL);
    // 创建一个与屏幕设备上下文兼容的内存设备上下文
    HDC hMemoryDC = CreateCompatibleDC(hScreenDC);
    // 创建一个位图对象，用于存储截图
    HBITMAP hBitmap = CreateCompatibleBitmap(hScreenDC, width, height);
    // 将位图对象选入内存设备上下文
    SelectObject(hMemoryDC, hBitmap);
    // 将屏幕内容拷贝到内存设备上下文中
    BitBlt(hMemoryDC, 0, 0, width, height, hScreenDC, 0, 0, SRCCOPY);

    // 保存位图到文件
    std::string filename = "screenshot.bmp";
    HBITMAP hOldBitmap = (HBITMAP)SelectObject(hMemoryDC, hBitmap);
    BITMAP bitmap;
    GetObject(hBitmap, sizeof(BITMAP), &bitmap);
    BITMAPFILEHEADER bmpFileHeader;
    bmpFileHeader.bfType = 0x4D42;
    bmpFileHeader.bfSize = sizeof(BITMAPFILEHEADER) + sizeof(BITMAPINFOHEADER) + bitmap.bmWidthBytes * bitmap.bmHeight;
    bmpFileHeader.bfReserved1 = 0;
    bmpFileHeader.bfReserved2 = 0;
    bmpFileHeader.bfOffBits = sizeof(BITMAPFILEHEADER) + sizeof(BITMAPINFOHEADER);
    BITMAPINFOHEADER bmpInfoHeader;
    bmpInfoHeader.biSize = sizeof(BITMAPINFOHEADER);
    bmpInfoHeader.biWidth = bitmap.bmWidth;
    bmpInfoHeader.biHeight = bitmap.bmHeight;
    bmpInfoHeader.biPlanes = 1;
    bmpInfoHeader.biBitCount = 24;
    bmpInfoHeader.biCompression = BI_RGB;
    bmpInfoHeader.biSizeImage = 0;
    bmpInfoHeader.biXPelsPerMeter = 0;
    bmpInfoHeader.biYPelsPerMeter = 0;
    bmpInfoHeader.biClrUsed = 0;
    bmpInfoHeader.biClrImportant = 0;
    std::ofstream file(filename, std::ios::binary);
    file.write(reinterpret_cast<const char*>(&bmpFileHeader), sizeof(BITMAPFILEHEADER));
    file.write(reinterpret_cast<const char*>(&bmpInfoHeader), sizeof(BITMAPINFOHEADER));
    file.write(reinterpret_cast<const char*>(bitmap.bmBits), bitmap.bmWidthBytes * bitmap.bmHeight);
    file.close();

    // 释放资源
    SelectObject(hMemoryDC, hOldBitmap);
    DeleteObject(hBitmap);
    DeleteDC(hMemoryDC);
    ReleaseDC(NULL, hScreenDC);

    std::cout << "截图已保存到 " << filename << std::endl;
}

int main()
{
    int screenId = 0;  // 屏幕ID，0表示主屏幕
    int width = 800;  // 截取区域宽度
    int height = 600;  // 截取区域高度

    CaptureScreen(screenId, width, height);

    return 0;
}
