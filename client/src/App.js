import React, { Component } from 'react';
import { formatDistance, differenceInHours, format } from 'date-fns';
import Mousetrap from 'mousetrap';
import ReactGA from 'react-ga';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';
import { withTranslation } from 'react-i18next';
import logo from './moose-shape.svg';
import camera from './photo-camera.svg';
import { dateFnsLocale } from './i18n';
import './App.css';

const gaId = process.env.REACT_APP_GOOGLE_ANALYTICS_ID;

if (gaId) {
  ReactGA.initialize(gaId);
  ReactGA.pageview(window.location.pathname + window.location.search); // TODO: Make more granular.
}

class App extends Component {
  constructor(props) {
    super(props);

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

    Mousetrap.bind('d', () => {
      if (!this.state.lightboxOpen) {
        return;
      }

      const password = window.prompt(props.t('app.delete_image_password_request'));
      this.onDeleteImage(this.state.lightboxImages[this.state.lightboxIndex].file_name, password);
    });

    setInterval(this.updateImages, 10000);
  }

  async updateImages() {
    const res = await fetch('/api/images.json');
    const images = await res.json();

    this.setState({ images });
  }

  async onDeleteImage(imageId, password) {
    await fetch(`/api/images/${imageId}/${password}`, { method: 'DELETE' });
    this.updateImages();
    this.onCloseViewer();
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
    const { t } = this.props;

    const ts = lightboxOpen && new Date(lightboxImages[lightboxIndex].email_created_at * 1000);
    const lightboxCaption =
      lightboxOpen && t('app.image_caption', {
        index: lightboxIndex + 1,
        total: lightboxImages.length,
        date: format(ts, 'dd.MM.yyyy', { locale: dateFnsLocale }),
        time: format(ts, 'HH:mm', { locale: dateFnsLocale }),
        temp: lightboxImages[lightboxIndex].temperature
      });

    const boxes = images.map((eventImages, index) => {
      const firstEmailCreatedAt = new Date(eventImages[0].email_created_at * 1000);
      const lastEmailCreatedAt = new Date(eventImages[eventImages.length - 1].email_created_at * 1000);
      const dateString = formatDistance(firstEmailCreatedAt, new Date(), { locale: dateFnsLocale });
      const timeString = format(firstEmailCreatedAt, 'HH:mm');
      const duration = formatDistance(firstEmailCreatedAt, lastEmailCreatedAt, { locale: dateFnsLocale });

      const newTag =
        Math.abs(differenceInHours(new Date(), firstEmailCreatedAt)) < 24 ? (
          <span className="activity-new">${t('app.new_label')}</span>
        ) : null;

      return (
        <div className="activity" key={eventImages.map(image => image.file_name).join()}>
          <img src={camera} className="camera-icon" alt="camera icon" />
          <span className="activity-title">
            {t('app.visit', { count: images.length - index })} {newTag}
          </span>
          <div className="activity-description">
            {t('app.timing', { time: timeString, date: dateString, duration })}
          </div>
          <div>
            {eventImages.map((image, imageIndex) => (
              <img
                key={image.file_name}
                alt="Camera snapshot thumbnail"
                onClick={() => this.onOpenViewer(eventImages, imageIndex)}
                className="activity-thumbnail"
                src={`/api/images/${image.file_name}_thumb.jpg`}
              ></img>
            ))}
          </div>
        </div>
      );
    });

    const computeUrl = image => `/api/images/${image.file_name}.jpg`;

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
          <div className="title">
            <img src={logo} className="logo" alt="logo" />
            {t('app.title')}
          </div>
          <div className="info" dangerouslySetInnerHTML={{ __html: t('app.info') }} />
        </header>
        {boxes}
        <footer className="footer">
          <span dangerouslySetInnerHTML={{
            __html:
              t('app.icons_copyright', {
                freepik_link: '<a href="http://www.freepik.com" rel="noopener" title="Freepik">Freepik</a>',
                flaticon_link: '<a href="https://www.flaticon.com/" rel="noopener" title="Flaticon">www.flaticon.com</a>',
                license_link: '<a href="http://creativecommons.org/licenses/by/3.0/" rel="noopener noreferrer" title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a>'
              })
          }} />{' '}
          {t('app.images_copyright')}
        </footer>
      </div>
    );
  }
}

export default withTranslation()(App);
