#include <iostream>
#include <filesystem>
#include <string>
#include <node_api.h>

napi_value CaptureScreenWrapper(napi_env env, napi_callback_info info) {
    size_t argc = 4;
    napi_value args[4];
    napi_get_cb_info(env, info, &argc, args, NULL, NULL);
    std::cout << argc << std::endl;
    if (argc < 4) {
        napi_throw_type_error(env, NULL, "Wrong number of arguments");
        return NULL;
    }

    napi_value resultValue;
    napi_create_object(env, &resultValue);

    napi_value value;
    napi_create_int32(env, 123, &value);

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
