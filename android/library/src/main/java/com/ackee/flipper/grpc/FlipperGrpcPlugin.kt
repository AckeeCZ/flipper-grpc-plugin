package com.ackee.flipper.grpc

import com.facebook.flipper.core.ErrorReportingRunnable
import com.facebook.flipper.core.FlipperArray
import com.facebook.flipper.core.FlipperObject
import com.facebook.flipper.plugins.common.BufferingFlipperPlugin
import io.grpc.ClientInterceptor

class FlipperGrpcPlugin : BufferingFlipperPlugin() {

    override fun getId() = "grpc"

    fun getInterceptor(): ClientInterceptor {
        return FlipperGrpcInterceptor(this)
    }

    fun reportRequest(request: Request) {
        object : ErrorReportingRunnable(connection) {
            @Throws(Exception::class)
            override fun runOrThrow() {
                send(
                    "newRequest", FlipperObject.Builder()
                        .put("id", request.id)
                        .put("timestamp", request.unixTimestampMs)
                        .put("authority", request.authority)
                        .put("method", request.method)
                        .put("headers", request.headers.toFlipperObject())
                        .put("data", request.data)
                        .build()
                )
            }
        }.run()
    }

    fun reportResponse(response: Response) {
        object : ErrorReportingRunnable(connection) {
            @Throws(Exception::class)
            override fun runOrThrow() {
                send(
                    "newResponse",
                    FlipperObject.Builder()
                        .put("id", response.id)
                        .put("timestamp", response.unixTimestampMs)
                        .put("status", response.status)
                        .put("headers", response.headers.toFlipperObject())
                        .put("data", response.data)
                        .build()
                )
            }
        }.run()
    }

    private fun List<Header>.toFlipperObject(): FlipperArray {
        val list = FlipperArray.Builder()
        for (header in this) {
            list.put(FlipperObject.Builder().put("key", header.key).put("value", header.value))
        }
        return list.build()
    }
}
