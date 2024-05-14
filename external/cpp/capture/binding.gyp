{
  "targets": [
    {
      "target_name": "screen_capture",
      "sources": ["screen_capture.cpp"],
      "libraries": [
        "-framework CoreGraphics",
        "-framework CoreFoundation",
        "-framework ImageIO",
        "-framework CoreServices",
      ]
    }
  ]
}