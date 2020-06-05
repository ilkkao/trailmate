import React, { Component } from 'react';
import { formatDistance, differenceInHours, format } from 'date-fns';
import fi from 'date-fns/locale/fi';
import Mousetrap from 'mousetrap';

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
    this.onCloseViewer = this.onCloseViewer.bind(this);
    this.onMoveNextRequest = this.onMoveNextRequest.bind(this);
    this.onMovePrevRequest = this.onMovePrevRequest.bind(this);
    this.updateImages = this.updateImages.bind(this);

    this.state = {
      images: window.preloadedImages || [],
      lightboxImages: [],
      lightboxCaption: '',
      lightboxIndex: 0,
      lightboxOpen: false
    };

    if (!window.preloadedImages) {
      this.updateImages();
    }

    Mousetrap.bind('f o o b a r', () => {
      if (!this.state.lightboxOpen) {
        return;
      }
    });

    setInterval(this.updateImages, 10000);
  }

  async updateImages() {
    const res = await fetch('/api/images.json');
    const images = await res.json();

    this.setState({ images });
  }

  async onDeleteImage(imageId, password) {
    const confirmed = confirm(`Haluatko varmasti tuhota kuvan?`); // eslint-disable-line no-restricted-globals

    if (confirmed) {
      await fetch(`/api/delete_image/${imageId}/${password}`, { method: 'DELETE' });
      this.updateImages();
      this.onCloseViewer();
    }
  }

  onOpenViewer(eventImages, imageIndex) {
    this.setState({
      lightboxImages: eventImages,
      lightboxIndex: imageIndex,
      lightboxOpen: true
    });
  }

  onCloseViewer() {
    this.setState({ lightboxOpen: false });
  }

  onMoveNextRequest() {
    this.setState({
      lightboxIndex: (this.state.lightboxIndex + 1) % this.state.lightboxImages.length
    });
  }

  onMovePrevRequest() {
    this.setState({
      lightboxIndex:
        (this.state.lightboxIndex + this.state.lightboxImages.length - 1) % this.state.lightboxImages.length
    });
  }

  render() {
    const { images, lightboxIndex, lightboxOpen, lightboxImages } = this.state;

    const lightboxCaption =
      lightboxOpen &&
      `Kuva: ${lightboxIndex + 1}/${lightboxImages.length} - ${format(
        new Date(lightboxImages[lightboxIndex].email_created_at * 1000),
        `dd.MM.yyyy 'kello' HH:mm`,
        { locale: fi }
      )} - Lämpötila: ${lightboxImages[lightboxIndex].temperature}°C`;

    const boxes = images.map((eventImages, index) => {
      const firstEmailCreatedAt = new Date(eventImages[0].email_created_at * 1000);
      const lastEmailCreatedAt = new Date(eventImages[eventImages.length - 1].email_created_at * 1000);
      const dateString = formatDistance(firstEmailCreatedAt, new Date(), { locale: fi });
      const timeString = format(firstEmailCreatedAt, 'HH:mm');
      const duration = formatDistance(firstEmailCreatedAt, lastEmailCreatedAt, { locale: fi });

      const newTag =
        Math.abs(differenceInHours(new Date(), firstEmailCreatedAt)) < 24 ? (
          <span className="activity-new">UUSI - ALLE 24H</span>
        ) : null;

      return (
        <div className="activity" key={eventImages.map(image => image.file_name).join()}>
          <img src={camera} className="camera-icon" alt="[camera]" />
          <span className="activity-title">
            Vierailu #{images.length - index} {newTag}
          </span>
          <div className="activity-description">
            Alkoi kello {timeString}, {dateString} sitten. Pituus {duration}.
          </div>
          <div>
            {eventImages.map((image, imageIndex) => (
              <img
                key={image.file_name}
                alt="Riistakameran kuva"
                onClick={() => this.onOpenViewer(eventImages, imageIndex)}
                className="activity-thumbnail"
                src={`/camera-images/${image.file_name}_thumb.jpg`}
              ></img>
            ))}
          </div>
        </div>
      );
    });

    const computeUrl = image => `/camera-images/${image.file_name}.jpg`;

    return (
      <div className="main-container">
        {lightboxOpen && (
          <Lightbox
            mainSrc={computeUrl(lightboxImages[lightboxIndex])}
            nextSrc={computeUrl(lightboxImages[(lightboxIndex + 1) % lightboxImages.length])}
            prevSrc={computeUrl(lightboxImages[(lightboxIndex + lightboxImages.length - 1) % lightboxImages.length])}
            onCloseRequest={this.onCloseViewer}
            imageCaption={lightboxCaption}
            onMoveNextRequest={this.onMoveNextRequest}
            onMovePrevRequest={this.onMovePrevRequest}
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
