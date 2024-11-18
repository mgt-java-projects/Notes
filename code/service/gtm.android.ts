Add Google Tag Manager SDK Dependency
Open android/app/build.gradle in your project.
Add the following dependency under dependencies

implementation 'com.google.android.gms:play-services-tagmanager:17.0.0'
---------

2

2. Create the GTMManager Class
In your Android plugin package folder, typically android/src/main/java/com/yourapp/gtmplugin/, create a new Java class named GTMManager.java.

Add the following code to define the GTMManager singleton for GTM initialization and event tracking:

package com.yourapp.gtmplugin;

import android.content.Context;
import com.google.android.gms.tagmanager.DataLayer;
import com.google.android.gms.tagmanager.TagManager;
import com.google.android.gms.tagmanager.Container;
import com.google.android.gms.tagmanager.ContainerOpener;

public class GTMManager {
    private static GTMManager instance;
    private Container container;

    private GTMManager() {}

    public static GTMManager getInstance() {
        if (instance == null) {
            instance = new GTMManager();
        }
        return instance;
    }

    public void initialize(Context context, String gtmId) {
        TagManager tagManager = TagManager.getInstance(context);
        ContainerOpener.openContainer(tagManager, gtmId, ContainerOpener.OpenType.PREFER_NON_DEFAULT, new ContainerOpener.Notifier() {
            @Override
            public void containerAvailable(Container container) {
                GTMManager.this.container = container;
            }
        });
    }

    public void trackEvent(String eventName, String category, String action) {
        if (container == null) {
            return;
        }
        DataLayer dataLayer = TagManager.getInstance(container.getContext()).getDataLayer();
        dataLayer.push(DataLayer.mapOf("event", eventName, "category", category, "action", action));
    }
}

-----------------
3. Create the Plugin Class
In the same package, create a new Java class named GtmPlugin.java.

Import GTMManager and define methods to call initialize and trackEvent.


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
-------------
Register and Use the Plugin in Your Angular App
In src/index.ts of the plugin, register the plugin:

import { registerPlugin } from '@capacitor/core';
import type { GtmPlugin } from './definitions';

const GtmPlugin = registerPlugin<GtmPlugin>('GtmPlugin', {
    web: () => import('./web').then(m => new m.GtmPluginWeb()),
});

export * from './definitions';
export { GtmPlugin };
---------------------


one class

package com.yourapp.gtmplugin;

import android.content.Context;
import android.util.Log;
import com.google.android.gms.tagmanager.DataLayer;
import com.google.android.gms.tagmanager.TagManager;
import com.google.android.gms.tagmanager.Container;
import com.google.android.gms.tagmanager.ContainerOpener;
import com.getcapacitor.Plugin;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.PluginCall;
import com.getcapacitor.JSObject;

@CapacitorPlugin(name = "GtmPlugin")
public class GtmPlugin extends Plugin {

    private static final String TAG = "GtmPlugin";
    private Container container;

    @PluginMethod
    public void initialize(PluginCall call) {
        String gtmId = call.getString("gtmId");
        if (gtmId == null || gtmId.isEmpty()) {
            call.reject("GTM ID is required");
            return;
        }
        initializeGtm(getContext(), gtmId);
        call.resolve();
    }

    private void initializeGtm(Context context, String gtmId) {
        TagManager tagManager = TagManager.getInstance(context);
        ContainerOpener.openContainer(tagManager, gtmId, ContainerOpener.OpenType.PREFER_NON_DEFAULT, new ContainerOpener.Notifier() {
            @Override
            public void containerAvailable(Container container) {
                GtmPlugin.this.container = container;
                Log.d(TAG, "GTM initialized successfully with container ID: " + gtmId);
            }
        });
    }

    @PluginMethod
    public void trackEvent(PluginCall call) {
        if (container == null) {
            call.reject("GTM container is not initialized");
            return;
        }

        String eventName = call.getString("eventName");
        if (eventName == null || eventName.isEmpty()) {
            call.reject("eventName is required");
            return;
        }

        JSObject parameters = call.getObject("parameters", new JSObject());
        DataLayer dataLayer = TagManager.getInstance(container.getContext()).getDataLayer();

        // Push the event and parameters to the GTM DataLayer
        dataLayer.push(DataLayer.mapOf("event", eventName, "parameters", parameters.toString()));

        call.resolve();
    }
}
---------

