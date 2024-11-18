src/definitions.ts

export interface GtmPlugin {
    initialize(options: { gtmId: string }): Promise<void>;
    trackEvent(options: { eventName: string, parameters: any }): Promise<void>;
  }

3. Implement the Plugin Logic
iOS: Implement GTM Initialization and Event Tracking
Open ios/Plugin/GtmPlugin.swift.
Import your GTMManager and implement the initialize and trackEvent methods to call GTMManager.

import Capacitor
import Foundation

@objc(GtmPlugin)
public class GtmPlugin: CAPPlugin {

    @objc func initialize(_ call: CAPPluginCall) {
        let gtmId = call.getString("gtmId") ?? ""
        GTMManager.shared.initialize(gtmId: gtmId) { success in
            if success {
                call.resolve()
            } else {
                call.reject("Failed to initialize GTM")
            }
        }
    }

    @objc func trackEvent(_ call: CAPPluginCall) {
        guard let eventName = call.getString("eventName") else {
            call.reject("eventName is required")
            return
        }
        let parameters = call.getObject("parameters") ?? [:]
        GTMManager.shared.trackEvent(eventName: eventName, parameters: parameters)
        call.resolve()
    }
}

--------
Android: Implement GTM Initialization and Event Tracking
Open android/src/main/java/[package_name]/GtmPlugin.java.
Import your GTMManager and implement the initialize and trackEvent methods.

package com.yourapp.gtmplugin;

import com.getcapacitor.Plugin;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.JSObject;

@CapacitorPlugin(name = "GtmPlugin")
public class GtmPlugin extends Plugin {

    @PluginMethod
    public void initialize(PluginCall call) {
        String gtmId = call.getString("gtmId");
        GTMManager.getInstance().initialize(getContext(), gtmId);
        call.resolve();
    }

    @PluginMethod
    public void trackEvent(PluginCall call) {
        String eventName = call.getString("eventName");
        JSObject parameters = call.getObject("parameters");
        
        if (eventName == null) {
            call.reject("eventName is required");
            return;
        }

        GTMManager.getInstance().trackEvent(eventName, parameters.getString("category"), parameters.getString("action"));
        call.resolve();
    }
}

--------------
Register the Plugin for Angular
Open src/index.ts in the plugin directory, and export the plugin definition:

import { registerPlugin } from '@capacitor/core';
import type { GtmPlugin } from './definitions';

const GtmPlugin = registerPlugin<GtmPlugin>('GtmPlugin', {
  web: () => import('./web').then(m => new m.GtmPluginWeb()),
});

export * from './definitions';
export { GtmPlugin };


---------
gtm.service.ts:

import { Injectable } from '@angular/core';
import { Plugins } from '@capacitor/core';
import type { GtmPlugin } from 'gtm-plugin';

const { GtmPlugin } = Plugins;

@Injectable({ providedIn: 'root' })
export class GtmService {
    async initialize(gtmId: string) {
        try {
            await GtmPlugin.initialize({ gtmId });
        } catch (error) {
            console.error('Failed to initialize GTM:', error);
        }
    }

    async trackEvent(eventName: string, parameters: any) {
        try {
            await GtmPlugin.trackEvent({ eventName, parameters });
        } catch (error) {
            console.error('Failed to track event:', error);
        }
    }
}


-----------

constructor(private gtmService: GtmService) {}

    ngOnInit() {
        this.gtmService.initialize('GTM-XXXX');
    }

    trackUserEvent() {
        this.gtmService.trackEvent('button_click', { category: 'User', action: 'Click' });
    }

    