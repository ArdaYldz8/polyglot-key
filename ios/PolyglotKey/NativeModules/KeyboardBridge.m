#import "KeyboardBridge.h"
#import <React/RCTLog.h>

@implementation KeyboardBridge

RCT_EXPORT_MODULE();

// Required for RCTEventEmitter
- (NSArray<NSString *> *)supportedEvents {
    return @[@"KeyboardEvent"];
}

/**
 * Get keyboard settings from UserDefaults
 */
RCT_EXPORT_METHOD(getKeyboardSettings:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    @try {
        NSUserDefaults *defaults = [[NSUserDefaults alloc] initWithSuiteName:@"group.polyglot.keyboard"];
        
        NSDictionary *settings = @{
            @"sourceLanguage": [defaults objectForKey:@"source_language"] ?: @"en",
            @"targetLanguage": [defaults objectForKey:@"target_language"] ?: @"tr",
            @"translationEnabled": @([defaults boolForKey:@"translation_enabled"] ?: YES),
            @"hapticFeedback": @([defaults boolForKey:@"haptic_feedback"] ?: YES),
            @"soundFeedback": @([defaults boolForKey:@"sound_feedback"] ?: NO),
            @"keyboardTheme": [defaults objectForKey:@"keyboard_theme"] ?: @"system",
            @"autoTranslate": @([defaults boolForKey:@"auto_translate"] ?: NO),
            @"translationDelay": @([defaults integerForKey:@"translation_delay"] ?: 500)
        };
        
        resolve(settings);
    } @catch (NSException *exception) {
        reject(@"SETTINGS_ERROR", @"Failed to get keyboard settings", nil);
    }
}

/**
 * Update keyboard settings in UserDefaults
 */
RCT_EXPORT_METHOD(updateKeyboardSettings:(NSDictionary *)settings
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    @try {
        NSUserDefaults *defaults = [[NSUserDefaults alloc] initWithSuiteName:@"group.polyglot.keyboard"];
        
        if (settings[@"sourceLanguage"]) {
            [defaults setObject:settings[@"sourceLanguage"] forKey:@"source_language"];
        }
        if (settings[@"targetLanguage"]) {
            [defaults setObject:settings[@"targetLanguage"] forKey:@"target_language"];
        }
        if (settings[@"translationEnabled"]) {
            [defaults setBool:[settings[@"translationEnabled"] boolValue] forKey:@"translation_enabled"];
        }
        if (settings[@"hapticFeedback"]) {
            [defaults setBool:[settings[@"hapticFeedback"] boolValue] forKey:@"haptic_feedback"];
        }
        if (settings[@"soundFeedback"]) {
            [defaults setBool:[settings[@"soundFeedback"] boolValue] forKey:@"sound_feedback"];
        }
        if (settings[@"keyboardTheme"]) {
            [defaults setObject:settings[@"keyboardTheme"] forKey:@"keyboard_theme"];
        }
        if (settings[@"autoTranslate"]) {
            [defaults setBool:[settings[@"autoTranslate"] boolValue] forKey:@"auto_translate"];
        }
        if (settings[@"translationDelay"]) {
            [defaults setInteger:[settings[@"translationDelay"] integerValue] forKey:@"translation_delay"];
        }
        
        [defaults synchronize];
        
        // Notify keyboard extension of settings change
        [self sendEventWithName:@"KeyboardEvent" body:@{
            @"event": @"settingsUpdated",
            @"data": settings
        }];
        
        resolve(@YES);
    } @catch (NSException *exception) {
        reject(@"SETTINGS_UPDATE_ERROR", @"Failed to update keyboard settings", nil);
    }
}

/**
 * Get translation history from UserDefaults
 */
RCT_EXPORT_METHOD(getTranslationHistory:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    @try {
        NSUserDefaults *defaults = [[NSUserDefaults alloc] initWithSuiteName:@"group.polyglot.keyboard"];
        NSArray *history = [defaults arrayForKey:@"translation_history"] ?: @[];
        
        resolve(history);
    } @catch (NSException *exception) {
        reject(@"HISTORY_ERROR", @"Failed to get translation history", nil);
    }
}

/**
 * Add translation to history
 */
RCT_EXPORT_METHOD(addTranslationToHistory:(NSDictionary *)translation
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    @try {
        NSUserDefaults *defaults = [[NSUserDefaults alloc] initWithSuiteName:@"group.polyglot.keyboard"];
        NSMutableArray *history = [[defaults arrayForKey:@"translation_history"] mutableCopy] ?: [[NSMutableArray alloc] init];
        
        // Create new translation item
        NSMutableDictionary *newItem = [translation mutableCopy];
        if (!newItem[@"id"]) {
            newItem[@"id"] = [NSString stringWithFormat:@"%.0f", [[NSDate date] timeIntervalSince1970] * 1000];
        }
        newItem[@"timestamp"] = @([[NSDate date] timeIntervalSince1970] * 1000);
        
        // Add to beginning of array
        [history insertObject:newItem atIndex:0];
        
        // Limit history to 1000 items
        if (history.count > 1000) {
            [history removeObjectsInRange:NSMakeRange(1000, history.count - 1000)];
        }
        
        [defaults setObject:history forKey:@"translation_history"];
        [defaults synchronize];
        
        resolve(@YES);
    } @catch (NSException *exception) {
        reject(@"HISTORY_ADD_ERROR", @"Failed to add translation to history", nil);
    }
}

/**
 * Clear translation history
 */
RCT_EXPORT_METHOD(clearTranslationHistory:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    @try {
        NSUserDefaults *defaults = [[NSUserDefaults alloc] initWithSuiteName:@"group.polyglot.keyboard"];
        [defaults setObject:@[] forKey:@"translation_history"];
        [defaults synchronize];
        
        resolve(@YES);
    } @catch (NSException *exception) {
        reject(@"HISTORY_CLEAR_ERROR", @"Failed to clear translation history", nil);
    }
}

/**
 * Check if keyboard is enabled in system settings
 */
RCT_EXPORT_METHOD(isKeyboardEnabled:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    @try {
        // On iOS, we can't directly check if a keyboard extension is enabled
        // We'll check if the app group container exists as a proxy
        NSUserDefaults *defaults = [[NSUserDefaults alloc] initWithSuiteName:@"group.polyglot.keyboard"];
        BOOL isEnabled = (defaults != nil);
        
        resolve(@(isEnabled));
    } @catch (NSException *exception) {
        reject(@"KEYBOARD_STATUS_ERROR", @"Failed to check keyboard status", nil);
    }
}

/**
 * Open keyboard settings in system
 */
RCT_EXPORT_METHOD(openKeyboardSettings:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    @try {
        dispatch_async(dispatch_get_main_queue(), ^{
            NSURL *settingsURL = [NSURL URLWithString:UIApplicationOpenSettingsURLString];
            if ([[UIApplication sharedApplication] canOpenURL:settingsURL]) {
                [[UIApplication sharedApplication] openURL:settingsURL options:@{} completionHandler:^(BOOL success) {
                    resolve(@(success));
                }];
            } else {
                reject(@"KEYBOARD_SETTINGS_ERROR", @"Cannot open keyboard settings", nil);
            }
        });
    } @catch (NSException *exception) {
        reject(@"KEYBOARD_SETTINGS_ERROR", @"Failed to open keyboard settings", nil);
    }
}

/**
 * Get keyboard usage statistics
 */
RCT_EXPORT_METHOD(getKeyboardStats:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    @try {
        NSUserDefaults *defaults = [[NSUserDefaults alloc] initWithSuiteName:@"group.polyglot.keyboard"];
        
        NSDictionary *stats = @{
            @"totalTranslations": @([defaults integerForKey:@"total_translations"]),
            @"totalKeystrokes": @([defaults integerForKey:@"total_keystrokes"]),
            @"averageTranslationTime": @([defaults doubleForKey:@"avg_translation_time"]),
            @"mostUsedLanguagePair": [defaults objectForKey:@"most_used_language_pair"] ?: @"en-tr",
            @"lastUsed": @([defaults doubleForKey:@"last_used"]),
            @"sessionsCount": @([defaults integerForKey:@"sessions_count"])
        };
        
        resolve(stats);
    } @catch (NSException *exception) {
        reject(@"STATS_ERROR", @"Failed to get keyboard statistics", nil);
    }
}

/**
 * Update keyboard statistics
 */
RCT_EXPORT_METHOD(updateKeyboardStats:(NSDictionary *)stats
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    @try {
        NSUserDefaults *defaults = [[NSUserDefaults alloc] initWithSuiteName:@"group.polyglot.keyboard"];
        
        if (stats[@"totalTranslations"]) {
            [defaults setInteger:[stats[@"totalTranslations"] integerValue] forKey:@"total_translations"];
        }
        if (stats[@"totalKeystrokes"]) {
            [defaults setInteger:[stats[@"totalKeystrokes"] integerValue] forKey:@"total_keystrokes"];
        }
        if (stats[@"averageTranslationTime"]) {
            [defaults setDouble:[stats[@"averageTranslationTime"] doubleValue] forKey:@"avg_translation_time"];
        }
        if (stats[@"mostUsedLanguagePair"]) {
            [defaults setObject:stats[@"mostUsedLanguagePair"] forKey:@"most_used_language_pair"];
        }
        if (stats[@"lastUsed"]) {
            [defaults setDouble:[stats[@"lastUsed"] doubleValue] forKey:@"last_used"];
        }
        if (stats[@"sessionsCount"]) {
            [defaults setInteger:[stats[@"sessionsCount"] integerValue] forKey:@"sessions_count"];
        }
        
        [defaults synchronize];
        resolve(@YES);
    } @catch (NSException *exception) {
        reject(@"STATS_UPDATE_ERROR", @"Failed to update keyboard statistics", nil);
    }
}

// Required for RCTEventEmitter
- (void)startObserving {
    // Called when the first observer is added
}

- (void)stopObserving {
    // Called when the last observer is removed
}

@end 