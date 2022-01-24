import React, { useEffect, useState,useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, StatusBar } from 'react-native';
import { Camera } from 'expo-camera';
import { cameraWithTensors, detectGLCapabilities } from '@tensorflow/tfjs-react-native';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from "@tensorflow-models/coco-ssd"
const handpose = require('@tensorflow-models/handpose');
const TensorCamera = cameraWithTensors(Camera);
import * as Permissions from 'expo-permissions';
import Canvas from 'react-native-canvas';
import { cutBoxFromImageAndResize } from '@tensorflow-models/handpose/dist/box';
require('@tensorflow/tfjs-backend-webgl');
require('@tensorflow/tfjs-backend-cpu');
require('@tensorflow/tfjs-core');
export default function App() {
  const [model, setModel] = useState();
  const [value,setvalue]=useState(0)
  const canvasRef = useRef(null);
  const [hand,setHand]=useState('Camera Opening')
 async function loadModel() {
  try {
  const model = await handpose.load();
  setModel(model);
  setvalue(1)
  setHand('No Hand')
  console.log("set loaded Model");
  } 
  catch (err) {
  console.log(err);
  console.log("failed load model");
  }
  }

  useEffect(async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    setCamera(prevState => ({ ...prevState, hasCameraPermission: status === 'granted' }));
    console.log('hello')
    tf.ready().then(() => {
      loadModel();
      });
    // setValue(await cocoSsd.load())
    console.log('complete');
    // const ctx = canvasRef.current.getContext("2d");

    // ctx.fillStyle = '#000000'
    // ctx.beginPath()
    // ctx.arc(300, 90, 50, 50, 4*Math.PI)
    // ctx.fill()
  }, []);
// function draw(ctx){
//   ctx.beginPath();
//   ctx.arc(100,75,60,0,4*Math.PI);
//   ctx.stroke();
//   ctx.z
// }
     function handleCameraStream(images, updatePreview, gl) {
    // const model=await cocoSsd.load()
    // console.log('indian')
    const loop = async () => {
      const nextImageTensor = images.next().value;
      
      // console.log('hi2')
      // console.log(nextImageTensor)
      const predictions = await model.estimateHands(nextImageTensor)
      console.log('Predictions: ');
      console.log(predictions);
      const ctx = canvasRef.current.getContext("2d");
      drawRectangle(predictions,ctx)
      // console.log(nextImageTensor+"Hello")

      //
      // do something with tensor here
      //

      // if autorender is false you need the following two lines.
      // updatePreview();;. knm 
      // gl.endFrameEXP();
      requestAnimationFrame(loop);
    }
    loop();
  }
  function drawRectangle(prediction,ctx){
    
    if(prediction.length>0){
      prediction.forEach((prediction)=>{
        const landmarks=prediction.landmarks;
        for(let i=0;i<landmarks.length;i++){
          const x=landmarks[i][0];
          const y=landmarks[i][1]
          setHand('Hand')
          // {<Text style={{left:x,right:y,fontSize:25,zIndex:100000000000000000}}>hmbhbhbhbh</Text>}
          // // ctx.fillStyle = 'purple';
          // // ctx.fillRect(0, 0, 100, 100);
          // ctx.beginPath();
          // ctx.arc(x,y,5,0,3*Math.PI);
          // ctx.fillStyle="Indigo";
          // ctx.fill();
          // ctx.fillStyle = '#000000'
          // ctx.beginPath()
          // ctx.arc(300, 150, 10, 10, 3*Math.PI)
          // ctx.fill()
          console.log('complete')
        }
      })
    }
    else{
      setHand('No Hand')
    }
  }
  let textureDims;
  if (Platform.OS === 'ios') {
    textureDims = {
      height: 1920,                                            
      width: 1080,
    };
  } else {
    textureDims = {
      height: 1200,
      width: 1600,
    };
  }
  const [camera, setCamera] = useState({
    hasCameraPermission: null,
    type: Camera.Constants.Type.back,
  });

  if (camera.hasCameraPermission === null) {
    return <View />;
  } else if (camera.hasCameraPermission === false) {
    return <Text>No access to camera</Text>;
  } else {
    return (
      
        <View style={{flex:1,backgroundColor:'green'}}>
          <StatusBar hidden={true}></StatusBar>
          <Text style={{fontSize:25,zIndex:1000000000,position: "absolute",
          left: 0,
          right: 0,width:"100%",height:"100%",textAlign:'center',textAlignVertical:'center',color:'red'}}>{hand}</Text>

           {value!=0 &&
          // <Canvas ref={canvasRef}>
      <TensorCamera
        // Standard Camera props
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          // zindex: -9,
          // marginTop:200,
          width: "100%",
          height: "100%",
        }}
        type={Camera.Constants.Type.front}
        cameraTextureHeight={(textureDims.height)}
        cameraTextureWidth={textureDims.width}
        resizeHeight={200}
        resizeWidth={152}
        resizeDepth={3}
        // Tensor related props
        onReady={handleCameraStream}
        autorender={true}
      >
        
      </TensorCamera>
           }
            <Canvas
            ref={canvasRef}
            style={{
              // position: "absolute",
              // left: 0,
              // right: 0,
              // zindex: 1000,
              width: "100%",
              height: "100%",
              backgroundColor:'blue'
            }}
           >
           </Canvas>      
               
      </View>
    )
  }
}


