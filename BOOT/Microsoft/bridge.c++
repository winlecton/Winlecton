// bridge.cc — Native Node.js Addon stub for WinLectron
// Bridges Electron renderer ↔ native OS APIs via N-API
// Build with: node-gyp configure && node-gyp build

#include <napi.h>
#include <string>

// ── Get OS version string
Napi::String GetOSVersion(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  // TODO: call platform-specific version APIs (e.g. RtlGetVersion on Windows)
  return Napi::String::New(env, "WinLectron-Simulated");
}

// ── Get system uptime in seconds
Napi::Number GetUptime(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  // TODO: call GetTickCount64() / clock_gettime()
  return Napi::Number::New(env, 0.0);
}

// ── Module initializer
Napi::Object Init(Napi::Env env, Napi::Object exports) {
  exports.Set("getOSVersion", Napi::Function::New(env, GetOSVersion));
  exports.Set("getUptime",    Napi::Function::New(env, GetUptime));
  return exports;
}

NODE_API_MODULE(winlectron_bridge, Init)