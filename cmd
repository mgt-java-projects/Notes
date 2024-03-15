npx @capacitor/cli create --name google-play-referrer --npm-id com.example.googleplayreferrer

  // src/definitions.ts

declare module '@capacitor/core' {
  interface PluginRegistry {
    GooglePlayReferrer: GooglePlayReferrerPlugin;
  }
}

export interface GooglePlayReferrerPlugin {
  getReferrer(): Promise<{ url: string }>;
}


// android/src/main/java/com/example/googleplayreferrer/GooglePlayReferrerPlugin.java

package com.example.googleplayreferrer;

import android.content.Context;
import android.os.Bundle;
import android.util.Log;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.android.installreferrer.api.InstallReferrerClient;
import com.android.installreferrer.api.InstallReferrerStateListener;
import com.android.installreferrer.api.ReferrerDetails;

public class GooglePlayReferrerPlugin extends Plugin {

    private static final String TAG = "GooglePlayReferrer";

    @PluginMethod
    public void getReferrer(PluginCall call) {
        InstallReferrerClient referrerClient = InstallReferrerClient.newBuilder(getContext()).build();
        referrerClient.startConnection(new InstallReferrerStateListener() {
            @Override
            public void onInstallReferrerSetupFinished(int responseCode) {
                switch (responseCode) {
                    case InstallReferrerClient.InstallReferrerResponse.OK:
                        try {
                            ReferrerDetails referrerDetails = referrerClient.getInstallReferrer();
                            String referrerUrl = referrerDetails.getInstallReferrer();
                            Log.d(TAG, "Referrer URL: " + referrerUrl);
                            call.success(referrerUrl);
                        } catch (Exception e) {
                            Log.e(TAG, "Error retrieving referrer details: " + e.getMessage());
                            call.error("Error retrieving referrer details");
                        } finally {
                            referrerClient.endConnection();
                        }
                        break;
                    case InstallReferrerClient.InstallReferrerResponse.FEATURE_NOT_SUPPORTED:
                        Log.e(TAG, "Install referrer not supported");
                        call.error("Install referrer not supported");
                        break;
                    case InstallReferrerClient.InstallReferrerResponse.SERVICE_UNAVAILABLE:
                        Log.e(TAG, "Install referrer service unavailable");
                        call.error("Install referrer service unavailable");
                        break;
                    default:
                        Log.e(TAG, "Unexpected response code: " + responseCode);
                        call.error("Unexpected response code");
                        break;
                }
            }

            @Override
            public void onInstallReferrerServiceDisconnected() {
                Log.e(TAG, "Install referrer service disconnected");
                call.error("Install referrer service disconnected");
            }
        });
    }
}

implementation 'com.android.installreferrer:installreferrer:2.3'

  <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="com.android.vending.INSTALL_REFERRER" />
  

import { Plugins } from '@capacitor/core';

const { GooglePlayReferrer } = Plugins;

async function getReferrerUrl() {
  try {
    const { url } = await GooglePlayReferrer.getReferrer();
    console.log('Referrer URL:', url);
    // Do something with the referrer URL
  } catch (error) {
    console.error('Error getting referrer URL:', error);
    // Handle error
  }
}

// Call the function to retrieve the referrer URL
getReferrerUrl();


Testing

adb shell am broadcast -a com.android.vending.INSTALL_REFERRER \
-e referrer "https://example.com/path?param1=value1&param2=value2" \
-p YOUR_APP_PACKAGE_NAME_HERE
