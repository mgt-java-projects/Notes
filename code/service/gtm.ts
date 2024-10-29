npx @capacitor/cli plugin:generate

In GTMPlugin.ts (TypeScript in src/definitions.ts):

import { registerPlugin } from '@capacitor/core';

export interface GTMPlugin {
  initializeGTM(options: { containerId: string }): Promise<void>;
  pushEvent(event: { name: string, params: any }): Promise<void>;
}

const GTM = registerPlugin<GTMPlugin>('GTMPlugin');

export default GTM;


In ios/Plugin/Plugin.swift:
import Foundation
import Capacitor

@objc(GTMPlugin)
public class GTMPlugin: CAPPlugin {
    @objc func initializeGTM(_ call: CAPPluginCall) {
        let containerId = call.getString("containerId") ?? ""
        
        DispatchQueue.main.async {
            let script = """
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','\(containerId)');
            """
            self.bridge?.eval(script)
        }
        
        call.resolve()
    }

    @objc func pushEvent(_ call: CAPPluginCall) {
        let name = call.getString("name") ?? ""
        let params = call.getObject("params") ?? [:]
        
        DispatchQueue.main.async {
            var script = "window.dataLayer = window.dataLayer || [];\n"
            script += "window.dataLayer.push({ event: '\(name)', ...\(params) });"
            self.bridge?.eval(script)
        }
        
        call.resolve()
    }
}




In android/src/main/java/com/yourcompany/gtmplugin/GTMPlugin.java:


import com.getcapacitor.PluginCall;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.Bridge;
import com.getcapacitor.Plugin;

@CapacitorPlugin(name = "GTMPlugin")
public class GTMPlugin extends Plugin {

    @PluginMethod
    public void initializeGTM(PluginCall call) {
        String containerId = call.getString("containerId", "");
        
        String script = "(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':"
                + "new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],"
                + "j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src="
                + "'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);"
                + "})(window,document,'script','dataLayer','" + containerId + "');";
        getBridge().eval(script);
        
        call.resolve();
    }

    @PluginMethod
    public void pushEvent(PluginCall call) {
        String name = call.getString("name", "");
        JSONObject params = call.getObject("params");

        StringBuilder script = new StringBuilder("window.dataLayer = window.dataLayer || [];\n");
        script.append("window.dataLayer.push({ event: '").append(name).append("', ...").append(params.toString()).append(" });");
        getBridge().eval(script.toString());

        call.resolve();
    }
}


------
import GTM from 'your-plugin-path';

async initializeGTM() {
  await GTM.initializeGTM({ containerId: 'GTM-XXXXXXX' });
}

async trackEvent() {
  await GTM.pushEvent({ name: 'event_name', params: { key: 'value' } });
}
