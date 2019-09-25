import React, { Component } from 'react';
import Particles from 'react-particles-js';
import Navigation from './component/Navigation/Navigation';
import SignIn from './component/SignIn/SignIn';
import Register from './component/Register/Register'
import Logo from './component/Logo/Logo'
import ImageLinkForm from './component/ImageLinkForm/ImageLinkForm'
import Rank from './component/Rank/Rank';
import FaceRecognition from './component/FaceRecognition/FaceRecognition';
import './App.css';
import 'tachyons';

import Clarifai from 'clarifai';

const app = new Clarifai.App({
  apiKey: 'ae17b1eea2bb427abbb98e2ca41dd85a'
 });

const particlesOption = {
  
  particles: {
    number: {
      value: 30
    },
    line_linked: {
      shadow: {
          enable: true,
          color: "#3CA9D1",
          blur: 1
        }
      }
    }

}

class App extends Component {

  constructor(){
    super();
    this.state = {
      input: '',
      imageUrl: '',
      box: {},
      route: 'signin',
      isSignedIn: false,
      user: {
        id: '',
        name: '',
        password: '',
        email: '',
         entries: 0,
         joined: ''
      }
    }
    
  }

    
  onInputChange = (event) => {
    this.setState({input: event.target.value})
  }

  onButtonClick = () => {
    
    this.setState({imageUrl: this.state.input});

    app.models.predict(Clarifai.FACE_DETECT_MODEL, this.state.input)
    .then(response => {
      fetch('http://localhost:3000/image', {
        method: 'put',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          id: this.state.user.id
        })
      })
      .then(response => response.json())
      .then(count => {
        this.setState(Object.assign(this.state.user, { entries: count }))
      })

      this.displayFaceBox(this.calculateFaceLocation(response))
    })
    .catch(error => console.log(error))

  }

  calculateFaceLocation = (data) => {
    
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    console.log(clarifaiFace);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }

  }

  displayFaceBox = (box) => {
    console.log(box);
    this.setState({box: box});
  }

  onRouteChange = (route) => {
    if(route === 'home'){
      this.setState({isSignedIn: true})
    } else {
      this.setState({isSignedIn: false})
    }

    this.setState({route: route})
  }

  loadUser = (data) => {
    this.setState({user: {
        id: data.id,
        name: data.name,
        email: data.email,
        entries: data.entries,
        joined: data.joined
      }
    })
  }


  render(){

    const {isSignedIn, imageUrl, route, box} = this.state;

    return (
      <div className="App">
          <Particles className='particle' params={particlesOption} />
          <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange}/>
          {
            route === 'home'  
            ? <div>
                <Logo />
                <Rank name={this.state.user.name} entries={this.state.user.entries} />
                <ImageLinkForm onInputChange={this.onInputChange} onButtonClick={this.onButtonClick} />
                <FaceRecognition box={box} imageUrl={imageUrl} />
              </div> 
            : (
              route === 'signin'
              ? <SignIn loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
              : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
            )
          }
      </div>
    );
  }

}


export default App;
