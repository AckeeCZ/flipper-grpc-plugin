package com.ackee.flipper.grpc.sample

import android.os.Bundle
import android.util.Log
import android.widget.Button
import androidx.appcompat.app.AppCompatActivity
import io.grpc.examples.helloworld.GreeterGrpc
import io.grpc.examples.helloworld.HelloRequest
import io.grpc.okhttp.OkHttpChannelBuilder
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch

class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        val btnMakeRequest = findViewById<Button>(R.id.btn_make_request)
        btnMakeRequest.setOnClickListener {
            val channel = OkHttpChannelBuilder
                .forAddress(/* YOUR HOST */"10.0.2.2", 50051 /*YOUR PORT*/)
                .usePlaintext()
                .intercept(App.flipperGrpcPlugin.getInterceptor())
                .build()
            val greeterStub = GreeterGrpc.newBlockingStub(channel)

            GlobalScope.launch(Dispatchers.IO) {
                try {
                    val response = greeterStub.sayHello(
                        HelloRequest.newBuilder()
                            .setName("David")
                            .build()
                    )
                    Log.d(MainActivity::class.java.simpleName, response.message)
                } catch (e: Exception) {
                    e.printStackTrace()
                }
            }
        }
    }
}