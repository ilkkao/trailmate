import React, { Component } from 'react';
import { distanceInWords, differenceInHours, format } from 'date-fns'
import fi from 'date-fns/locale/fi';
// import qs from 'qs';

import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';

import logo from './moose-shape.svg';
import camera from './photo-camera.svg';
import './App.css';

class App extends Component {
  constructor() {
    super();

    this.onDeleteImage = this.onDeleteImage.bind(this);
    this.onOpenViewer = this.onOpenViewer.bind(this);
    this.updateImages = this.updateImages.bind(this);

    this.state = {
      images: window.preloadedImages || [],
      lightboxImages: [],
      lightboxCaption: '',
      lightboxIndex: 0,
      lightboxOpen: false,
    };

    if (!window.preloadedImages) {
      this.updateImages();
    }

    setInterval(this.updateImages, 10000);
  }

  async updateImages() {
    const res = await fetch('/api/images.json');
    const images = await res.json();

    this.setState({ images })
  }

  async onDeleteImage(imageId, password) {
    const confirmed = confirm(`Deleting image ${imageId}. Are you sure?`); // eslint-disable-line no-restricted-globals

    if (confirmed) {
      await fetch(`/api/delete_image/${imageId}/${password}`, { method: 'DELETE' });
      this.updateImages();
    }
  }

  onOpenViewer(lightboxImages, lightboxIndex, lightboxCaption) {
    this.setState({ lightboxImages, lightboxIndex, lightboxCaption, lightboxOpen: true });
  }

  render() {
    const { images, lightboxIndex, lightboxOpen, lightboxImages, lightboxCaption } = this.state;

    // const query = qs.parse(window.location.search, { ignoreQueryPrefix: true });

    const boxes = images.map((eventImages, index) => {
      const firstEmailCreatedAt = new Date(eventImages[0].email_created_at * 1000);
      const lastEmailCreatedAt = new Date(eventImages[eventImages.length - 1].email_created_at * 1000);

      const dateString = distanceInWords(firstEmailCreatedAt, new Date(), { locale: fi })
      const timeString = format(firstEmailCreatedAt, 'HH:mm')
      const duration = distanceInWords(firstEmailCreatedAt, lastEmailCreatedAt, { locale: fi })

      const newTag = Math.abs(differenceInHours(new Date(), firstEmailCreatedAt)) < 24
        ? <span className="activity-new">UUSI - ALLE 24H</span>
        : null;

      return (
        <div className="activity" key={eventImages.map(image => image.file_name).join()}>
          <img src={camera} className="camera-icon" alt="[camera]" />
          <span className="activity-title">#{images.length - index} {newTag}</span>
          <div className="activity-description">Alkoi kello {timeString}, {dateString} sitten. Pituus {duration}.</div>
          <div>
            {eventImages.map((image, imageIndex) =>
              <img
                key={image.file_name}
                alt="Riistakameran kuva"
                onClick={() => this.onOpenViewer(
                  eventImages.map(image => `/camera-images/${image.file_name}.jpg`),
                  imageIndex,
                  `Kuva: ${imageIndex + 1}/${eventImages.length} - Aika: ${format(new Date(image.email_created_at * 1000), 'DD.MM.YYYY kello HH:mm', { locale: fi })} - Lämpötila: ${image.temperature}°C`
                  )}
                className="activity-thumbnail" src={`/camera-images/${image.file_name}_thumb.jpg`}></img>)}
          </div>
        </div>
      );
    });

    return (
      <div className="main-container">
         {lightboxOpen && (
          <Lightbox
            mainSrc={lightboxImages[lightboxIndex]}
            nextSrc={lightboxImages[(lightboxIndex + 1) % lightboxImages.length]}
            prevSrc={lightboxImages[(lightboxIndex + lightboxImages.length - 1) % lightboxImages.length]}
            onCloseRequest={() => this.setState({ lightboxOpen: false })}
            imageCaption={lightboxCaption}
            imagePadding={50}
            onMovePrevRequest={() =>
              this.setState({
                lightboxIndex: (lightboxIndex + lightboxImages.length - 1) % lightboxImages.length,
              })
            }
            onMoveNextRequest={() =>
              this.setState({
                lightboxIndex: (lightboxIndex + 1) % lightboxImages.length,
              })
            }
          />
        )}
        <header>
          <div className="title"><img src={logo} className="logo" alt="logo" />Riistakamera Parkano</div>
          <div className="info">Trailcam</div>
        </header>
        {boxes}
        <footer className="footer">
          Icons made by
          <a href="http://www.freepik.com" rel="noopener" title="Freepik">Freepik</a>
          from
          <a href="https://www.flaticon.com/" rel="noopener" title="Flaticon">www.flaticon.com</a>
          are licensed by
          <a href="http://creativecommons.org/licenses/by/3.0/" rel="noopener" title="Creative Commons BY 3.0">CC 3.0 BY</a>
          Kuvat: &copy; 2018 Ilkka ja Oiva Oksanen.
        </footer>
      </div>
    );
  }
}

export default App;
