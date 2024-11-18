Step 1: Add the GTM Dependency
Open your iOS project’s Podfile, located in the ios/App directory.
Add the Google Tag Manager SDK as a dependency:

pod 'GoogleTagManager', '~> 7.0'

3 .Run pod install to install the GTM SDK:

cd ios/App
pod install

4.Open the generated .xcworkspace file (ios/App/App.xcworkspace) to work with the updated project.


Step 2: Create the GTM Plugin Class
In the ios/Plugin folder, create a new Swift file named GtmPlugin.swift.

Add the following code to initialize GTM and track events directly within the plugin:

--------

import Capacitor
import GoogleTagManager

@objc(GtmPlugin)
public class GtmPlugin: CAPPlugin {

    private var container: TAGContainer?

    @objc func initialize(_ call: CAPPluginCall) {
        guard let gtmId = call.getString("gtmId") else {
            call.reject("GTM ID is required")
            return
        }
        initializeGtm(gtmId: gtmId) { success in
            if success {
                call.resolve()
            } else {
                call.reject("Failed to initialize GTM")
            }
        }
    }

    private func initializeGtm(gtmId: String, completion: @escaping (Bool) -> Void) {
        let tagManager = TAGManager.instance()
        tagManager.logger.setLogLevel(kTAGLoggerLogLevelVerbose)
        TAGContainerOpener.openContainer(
            withId: gtmId,
            tagManager: tagManager,
            openType: kTAGOpenTypePreferFresh
        ) { [weak self] container in
            self?.container = container
            completion(container != nil)
        }
    }

    @objc func trackEvent(_ call: CAPPluginCall) {
        guard let eventName = call.getString("eventName") else {
            call.reject("eventName is required")
            return
        }
        let parameters = call.getObject("parameters") ?? [:]
        trackGtmEvent(eventName: eventName, parameters: parameters)
        call.resolve()
    }

    private func trackGtmEvent(eventName: String, parameters: [String: Any]) {
        guard let container = container else {
            print("GTM container is not initialized")
            return
        }
        container.dataLayer.push(["event": eventName, "parameters": parameters])
    }
}

----------

Step 3: Register the Plugin in Capacitor
Open ios/Plugin/Plugin.swift.
Register GtmPlugin by adding it to the CAP_PLUGIN list

import Capacitor

@objc public class Plugin: CAPPlugin {
    public override func load() {
        CAPBridge.register(GtmPlugin.self, with: "GtmPlugin")
    }
}

-------

Step 4: Register the Plugin for Angular
In the src folder of the plugin directory, open or create index.ts.

Register and export the plugin as follows:


import { registerPlugin } from '@capacitor/core';
import type { GtmPlugin } from './definitions';

const GtmPlugin = registerPlugin<GtmPlugin>('GtmPlugin', {
    web: () => import('./web').then(m => new m.GtmPluginWeb()),
});

export * from './definitions';
export { GtmPlugin };
