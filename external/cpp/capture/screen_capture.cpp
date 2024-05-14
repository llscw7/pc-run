#include <node_api.h>
#include <CoreGraphics/CoreGraphics.h>
#include <CoreFoundation/CoreFoundation.h>
#include <iostream>
#include <ImageIO/ImageIO.h>  
#include <CoreServices/CoreServices.h>
#include <string>
#include <filesystem>

// void captureScreen(const char* filename) {
//     CGDirectDisplayID displayId = kCGDirectMainDisplay;
//     CGImageRef screenshot = CGDisplayCreateImage(displayId);
    
//     CFURLRef url = CFURLCreateFromFileSystemRepresentation(NULL, (const UInt8*)filename, strlen(filename), false);
//     CGImageDestinationRef destination = CGImageDestinationCreateWithURL(url, kUTTypePNG, 1, NULL);
//     CGImageDestinationAddImage(destination, screenshot, NULL);
//     CGImageDestinationFinalize(destination);
    
//     CFRelease(destination);
//     CFRelease(url);
//     CGImageRelease(screenshot);
// }

int captureScreen(CGDirectDisplayID displayID, CGRect captureRect) {
    CGImageRef screenshot = CGDisplayCreateImageForRect(displayID, captureRect);
    if (screenshot) {
        CFURLRef desktopURL = CFURLCreateWithFileSystemPath(NULL, CFSTR("screenshot.png"), kCFURLPOSIXPathStyle, false);
        CGImageDestinationRef destination = CGImageDestinationCreateWithURL(desktopURL, kUTTypePNG, 1, NULL);
        CGImageDestinationAddImage(destination, screenshot, NULL);
        CGImageDestinationFinalize(destination);
        
        CFRelease(destination);
        CFRelease(desktopURL);
        CGImageRelease(screenshot);
        
        std::cout << "Screenshot captured and saved to the desktop." << std::endl;
        return 1;
    } else {
        std::cout << "Failed to capture screenshot." << std::endl;
        return 0;
    }
}

int GetMouseScreenInfo() {
    CGEventRef event = CGEventCreate(NULL);
    CGPoint cursorPos = CGEventGetLocation(event);
    CFRelease(event);

    CGDirectDisplayID display;
    uint32_t count;
    CGGetDisplaysWithPoint(cursorPos, 1, &display, &count);

    std::cout << "Mouse Clicked on Display: " << display << std::endl;
    std::cout << "Mouse Coordinates: X = " << cursorPos.x << ", Y = " << cursorPos.y << std::endl;

    return display;
}

napi_value CaptureScreenWrapper(napi_env env, napi_callback_info info) {
    size_t argc = 4;
    napi_value args[4];
    napi_get_cb_info(env, info, &argc, args, NULL, NULL);
    std::cout << argc << std::endl;
    if (argc < 4) {
        napi_throw_type_error(env, NULL, "Wrong number of arguments");
        return NULL;
    }

    // 获取屏幕数量
    uint32_t screenCount;
    CGGetActiveDisplayList(0, NULL, &screenCount);
    
    // 获取屏幕列表
    CGDirectDisplayID* displays = new CGDirectDisplayID[screenCount];
    CGGetActiveDisplayList(screenCount, displays, &screenCount);
    
    // 打印屏幕信息
    for (uint32_t i = 0; i < screenCount; i++) {
        CGDirectDisplayID displayID = displays[i];
        CGRect screenRect = CGDisplayBounds(displayID);
        std::cout << "Screen " << i << ": " << "x=" << screenRect.origin.x << ", y=" << screenRect.origin.y << ", width=" << screenRect.size.width << ", height=" << screenRect.size.height << std::endl;
    }

    // char filename[256];
    // size_t filenameSize;
    // napi_get_value_string_utf8(env, args[0], filename, sizeof(filename), &filenameSize);

    int x;
    int y;
    int width;
    int height;
    // int targetScreenIndex;
    napi_get_value_int32(env, args[0], &x);
    napi_get_value_int32(env, args[1], &y);
    napi_get_value_int32(env, args[2], &width);
    napi_get_value_int32(env, args[3], &height);
    // napi_get_value_int32(env, args[4], &targetScreenIndex);

    int targetScreenIndex = GetMouseScreenInfo();

    std::cout << x << '-' << y << '-' << width << '-' << height << '-' << targetScreenIndex << std::endl;

    // CGDirectDisplayID targetDisplayID = displays[targetScreenIndex];
    // CGRect captureRect = CGDisplayBounds(targetDisplayID);
    
    CGRect rect = CGRectMake(x, y, width, height);
    // 调用截图函数
    int result = captureScreen(targetScreenIndex, rect);
    // int result = 1;
    // napi_value resultValue;
    // napi_create_int32(env, result, &resultValue);

    napi_value resultValue;
    napi_create_object(env, &resultValue);

    napi_value value;
    napi_create_int32(env, result, &value);

    napi_set_named_property(env, resultValue, "code", value);

    std::filesystem::path currentPath = std::filesystem::current_path();
    napi_value dir;
    napi_create_string_utf8(env, currentPath.c_str(), NAPI_AUTO_LENGTH, &dir);
    
    napi_set_named_property(env, resultValue, "url", dir);

    return resultValue;
}

napi_value Init(napi_env env, napi_value exports) {
    napi_property_descriptor desc = {"captureScreen", 0, CaptureScreenWrapper, 0, 0, 0, napi_default, 0};
    napi_define_properties(env, exports, 1, &desc);
    return exports;
}

NAPI_MODULE(NODE_GYP_MODULE_NAME, Init)
