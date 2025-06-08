#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

/**
 * KeyboardBridge - iOS React Native bridge for keyboard communication
 * Handles settings synchronization, translation history, and keyboard status
 */
@interface KeyboardBridge : RCTEventEmitter <RCTBridgeModule>

@end 