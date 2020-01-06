import  React , {useState} from 'react';
import img_src from './daisies.jpg';
import wasmWorker from 'wasm-worker';

class Canvas extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      count: 0,
      loadedWasm: false,
      isLoaded: false,
      wasm: null,
      img: null
    };
  }
  componentDidMount() {
    this.loadWasm();
  }

  drawOriginalImage = async () => {
    const img = new Image();

    img.onload = () => {
      this.img = img;
      const canvas = this.refs.canvas;
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      
      ctx.drawImage(img, 0, 0);

    }
    img.src = img_src;
  }

  loadWasm = async () => {

    try {

      // if photon cannot be found, make sure to go to lib/pkg and run `npm link`
      // then navigate to the root of the react_app_demo dir, and run `npm link photon`
      const photon = await import('photon');

      this.wasm = photon;

      this.drawOriginalImage();

    } finally {
      console.log("loaded wasm successfully");
      this.loadedWasm = true;
      console.log("this.loadedWasm is", this.loadedWasm);
    }

  }
  
  alterChannel = async (channel_index) => {
    const canvas1 = this.refs.canvas;
    const ctx = canvas1.getContext("2d");
    
    ctx.drawImage(this.img, 0, 0);

    let photon = this.wasm;

    // Convert the canvas and context to a PhotonImage
    let image = photon.open_image(canvas1, ctx);

    // Filter the image
    photon.alter_channel(image, channel_index, 50);

    // Replace the current canvas' ImageData with the new image's ImageData.
    photon.putImageData(canvas1, ctx, image);

  }

  effectPipeline = async() => {
    const canvas1 = this.refs.canvas;
    const ctx = canvas1.getContext("2d");
    
    ctx.drawImage(this.img, 0, 0);

    let photon = this.wasm;


    let img_data = ctx.getImageData(0, 0, canvas1.width, canvas1.height);

    // Convert the raw base64 data to a PhotonImage.
    //let pImage = photon.photonimage_from_imgdata(img_data, canvas1.width, canvas1.height);
    // let pImage = new photon.PhotonImage(canvas1.width, canvas1.height);
    // pImage.set_imgdata(img_data);

    let phtimg = photon.PhotonImage.new_from_imgdata(canvas1.width, canvas1.height, img_data);


    // for (var i = 0; i < vec.length; i += 4) {
    //   vec[i] += 10;
    //   vec[i + 1] += 20;
    // }

    // Filter the image
    //photon.grayscale(phtimg);
    // photon.solarize(phtimg);
    // photon.alter_blue_channel(phtimg, 120);

    console.time("PHOTON_WITH_RAWPIX");
    photon.alter_channel(phtimg, 2, 70);

    console.timeEnd("PHOTON_WITH_RAWPIX");

    // photon.alter_red_channel_dyn(phtimg, 80);

    // // Replace the current canvas' ImageData with the new image's ImageData.
    photon.putImageData(canvas1, ctx, phtimg);



    console.time("PHOTON_CONSTR");
    // photon.canvas_wasm_only(canvas1, ctx);
    console.timeEnd("PHOTON_CONSTR");
  }
  
  render() {
    return(
      <div class="default">

        <div class="sidebar">
            <h3 class="logo">Photon</h3>

            <ul>
              <h4>Channels</h4>
              <li id="alter_red" onClick={() => this.alterChannel(0)}>Increase Red Channel</li>
              <li id="alter_green" onClick={() => this.alterChannel(1)}>Increase Green Channel</li>
              <li id="alter_blue" onClick={() => this.alterChannel(2)}>Increase Blue Channel</li>

              <li id="alter_blue" onClick={this.effectPipeline}>Inc Channel + Threshold</li>

            </ul>     
          </div>

          
          <div class="main">
            <div class="main_content">
   
              <section class="content">
                  <h2>Image</h2>
                  <canvas ref="canvas" />
              </section>

              <section class="benchmarks">
                <div id="time"></div>
                <div id="code"></div>
              </section>
          
          </div>
          
          </div>
          
      </div>
    )
  }
}

export default Canvas