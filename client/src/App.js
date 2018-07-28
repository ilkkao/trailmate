import React, { Component } from 'react';
import Gallery from 'react-grid-gallery';
import { distanceInWords, format } from 'date-fns'
import fi from 'date-fns/locale/fi';
import './App.css';

class App extends Component {
  constructor() {
    super();

    this.state = {
      images: []
    };
  }

  async componentDidMount() {
    const res = await fetch('/api/images.json');
    const images = await res.json();

    this.setState({ images })
  }

  render() {
    const { images } = this.state;

    const boxes = images.map((eventImages, index) => {
      const firstEmailCreatedAt = new Date(eventImages[0].email_created_at * 1000);
      const lastEmailCreatedAt = new Date(eventImages[eventImages.length - 1].email_created_at * 1000);

      const dateString = distanceInWords(firstEmailCreatedAt, new Date(), { locale: fi })
      const timeString = format(firstEmailCreatedAt, 'HH:mm')
      const duration = distanceInWords(firstEmailCreatedAt, lastEmailCreatedAt, { locale: fi })

      return (
        <div className="activity">
          <div className="activity-title">Aktiviteetti {images.length - index}:</div>
          <div className="activity-description">{dateString} sitten, alkoi {timeString}, pituus {duration}</div>
          <Gallery enableImageSelection={false} margin={1} showLightboxThumbnails={true} rowHeight={145} imageCountSeparator=" / " images={eventImages.map(image => ({
            src: `/camera-images/${image.file_name}.jpg`,
            thumbnail: `/camera-images/${image.file_name}_thumb.jpg`,
            thumbnailWidth: 170,
            thumbnailHeight: 145,
            margin: 1,
            tags: [{ title: "Uusi kuva", value: "UUSI, alle 24h" }],
            caption: `${format(new Date(image.email_created_at * 1000), 'DD.MM.YYYY kello  HH:mm', { locale: fi })}, lämpötila: ${image.temperature}°C`
          }))} />
        </div>
      )
    });

    return (
      <div className="main-container" >
        <div className="title">Riistakamera Parkano</div>
        {boxes}
      </div>
    );
  }
}

export default App;
