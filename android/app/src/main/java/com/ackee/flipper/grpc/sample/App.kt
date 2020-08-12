package com.ackee.flipper.grpc.sample

import android.app.Application
import com.ackee.flipper.grpc.FlipperGrpcPlugin
import com.facebook.flipper.android.AndroidFlipperClient
import com.facebook.flipper.plugins.inspector.DescriptorMapping
import com.facebook.flipper.plugins.inspector.InspectorFlipperPlugin
import com.facebook.soloader.SoLoader


/**
 * Application class
 */
class App : Application() {

    companion object {
        val flipperGrpcPlugin = FlipperGrpcPlugin()
    }

    override fun onCreate() {
        super.onCreate()
        SoLoader.init(this, false)

        val client = AndroidFlipperClient.getInstance(this)
        client.addPlugin(
            InspectorFlipperPlugin(this, DescriptorMapping.withDefaults())
        )
        client.addPlugin(flipperGrpcPlugin)
        client.start()
    }
}