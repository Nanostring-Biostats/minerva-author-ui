import React, { Component } from "react";

import SvgArrow from '../components/svgarrow.jsx'

import '../style/imageview';
import styled from 'styled-components';

class MinervaImageView extends Component {

  constructor() {
    super();
  }

  makeTileSource() {
    const {img} = this.props;
    const { url } = img;

		const getTileName = (x, y, level) => {
			return "0/" + level + "_" + x + "_" + y + ".png";
		}

		const getTileUrl = function(l, x, y) {
			const level = this.maxLevel - l;

			const name = getTileName(x, y, level);
			return url + '/' + name;
		}

    return {
			// Custom functions
			getTileUrl: getTileUrl,
			// Standard parameters
			tileSize: img.tilesize,
			width: img.width,
			height: img.height,
			maxLevel: img.maxLevel,
			minLevel: 0
    }
  }

  addChannels() {
    const {viewer} = this;
    const makeTileSource = this.makeTileSource.bind(this);
    const {img, channels} = this.props;
    viewer.addTiledImage({
      tileSource: makeTileSource(),
      width: img.width / img.height,
    });
  }

  componentDidMount() {
    const {channels, img, handleViewport} = this.props;
    const {interactor} = this.props;

    console.log('Creating new OpenSeadragon');
    // Set up openseadragon viewer
    this.viewer = OpenSeadragon({
      collectionMode: false,
      showZoomControl: false,
      showHomeControl: false,
      loadTilesWithAjax: true,
      showFullPageControl: false,
      immediateRender: true,
      // Specific to this project
      id: "ImageView",
      prefixUrl: "image/openseadragon/",
      maxZoomPixelRatio: 10,
      ajaxHeaders: {
        "Cache-Control": "no-store"
      }
    });
    interactor(this.viewer);

    this.addChannels();
    const world = this.viewer.world;
    world.addHandler('add-item', function(e) {
      e.item.setWidth(img.width / img.height);
    });

    this.viewer.addHandler('animation-finish', function(e) {
      const THIS = e.userData;
      const viewport = THIS.viewer.viewport;
      handleViewport(viewport);
    }, this);

    this.viewer.uuid = img.uuid;

		const viewer = this.viewer;

		function updateOverlays() {
				viewer.currentOverlays.forEach(overlay => {
						const isWhite = overlay.element.className == 'white-overlay';
						const isGreen = overlay.element.className == 'green-overlay';
						if (!(isWhite || isGreen)) {
							overlay.element.style.transform = '';
						}
				});
		}

		viewer.addHandler("update-viewport", function(){
				setTimeout(updateOverlays, 1);
		});

		viewer.addHandler("animation", updateOverlays);
  }

  componentDidUpdate() {
    const {viewer} = this;
    const {overlays, arrows} = this.props;

    this.viewer.viewport.setRotation(this.props.rotation);

    arrows.forEach((a,i) => {
      const o = a.position;
      const el = "label-" + i;
			const elNew = "new-" + el;
			const element = document.getElementById(el);
			let newElement = document.getElementById(elNew);
			if (!newElement) {
				newElement = element.cloneNode(true);
				newElement.id = elNew;
			}
			else {
				newElement.className = element.className;
        newElement.innerText = element.innerText;
			}
      const current = viewer.getOverlayById(elNew);
      const xy = new OpenSeadragon.Point(o[0], o[1]);
      if (current) {
        current.update({
          location: xy
        });
      }
      else {
        viewer.addOverlay({
          x: o[0],
          y: o[1],
          element: newElement,
          placement: OpenSeadragon.Placement.CENTER
        });
      }
    })
    arrows.forEach((a,i) => {
      const o = a.position;
      const el = "arrow-" + i;
			const elNew = "new-" + el;
			const element = document.getElementById(el);
			let newElement = document.getElementById(elNew);
			if (!newElement) {
				newElement = element.cloneNode(true);
				newElement.id = elNew;
			}
			else {
				newElement.className = element.className;
			}
      const current = viewer.getOverlayById(elNew);
      const xy = new OpenSeadragon.Point(o[0], o[1]);
      if (current) {
        current.update({
          location: xy
        });
      }
      else {
        viewer.addOverlay({
          x: o[0],
          y: o[1],
          element: newElement,
          placement: OpenSeadragon.Placement.CENTER
        });
      }
    })
    // Hide extra arrows
    for (var i = arrows.length; i < 100; i ++) {
      const elNew = "new-arrow-" + i;
      const current = viewer.getOverlayById(elNew);
      const xy = new OpenSeadragon.Point(-1, -1)
      if (current) {
        current.update({
          location: xy
        });
      }
    }
    for (var i = arrows.length; i < 100; i ++) {
      const elNew = "new-label-" + i;
      const current = viewer.getOverlayById(elNew);
      const xy = new OpenSeadragon.Point(-1, -1)
      if (current) {
        current.update({
          location: xy
        });
      }
    }
    overlays.forEach((o,i) => {
      const el = "overlay-" + i;
      const current = viewer.getOverlayById(el);
      const xy = new OpenSeadragon.Point(o[0], o[1]);
      if (current) {
        current.update({
          location: xy,
          width: o[2],
          height: o[3]
        });
      }
      else {
        viewer.addOverlay({
          x: o[0],
          y: o[1],
          width: o[2],
          height: o[3],
          element: el
        });
      }
    })
    // Hide extra overlays
    for (var i = overlays.length; i < 100; i ++) {
      const el = "overlay-" + i;
      const current = viewer.getOverlayById(el);
      const xy = new OpenSeadragon.Point(-1, -1)
      if (current) {
        current.update({
          location: xy,
          width: 0.001,
          height: 0.001
        });
      }
    }
    const {viewport} = viewer;
  }

  render() {
    const {viewer} = this;
    const {arrows} = this.props;

    const overlay_divs = [...Array(100).keys()].map((o,i) => {
      const el = "overlay-" + i;
      return (
        <div className="white-overlay"
             key={el} id={el}>
        </div>
      )
    })
    const arrow_divs = [...Array(arrows.length).keys()].map((o,i) => {
      const el = "arrow-" + i;
      const elText = "label-" + i;
      const radius = 122.8 / 2;
      const a = arrows.length > i ? arrows[i] : undefined;
      const angle = a && a.angle !== '' ? a.angle: 60;
      const a_y = radius * Math.sin(angle * Math.PI /180);
      const a_x = radius * Math.cos(angle * Math.PI /180);

      const t_w = 200;
      const t_h = 50;
      let t_x = 2 * a_x + t_w * Math.sign(Math.round(a_x)) / 2;
      let t_y = 2 * a_y + t_h * Math.sign(Math.round(a_y)) / 2;
      if (a.hide) {
        t_x = 0;
        t_y = 0;
      }

      let TransformArrow = styled.div`
        transform: translate(${a_x}px,${a_y}px)rotate(${angle}deg);
      `
      let TransformLabel = styled.div`
        transform: translate(${t_x}px,${t_y}px);
        background: rgba(0, 0, 0, .8);
        padding: 1em;
        width: ${t_w}px;
        height: ${t_h}px;
        overflow: hidden;
        color: white;
      `
			if (a.hide) {
				TransformArrow = styled.div`
					opacity: 0;
				`
			}
      if (a.text === '') {
        TransformLabel = styled.div`
					display: None;
        `
      }
      return (
        <div key={el}>
          <TransformArrow id={el}>
            <SvgArrow></SvgArrow>
          </TransformArrow>
          <TransformLabel id={elText}>
            {a.text}
          </TransformLabel>
        </div>
      )
    })
    return (
      <div>
        <div id="ImageView">
        </div>
        <div className="d-none">
          {overlay_divs}
          {arrow_divs}
        </div>
      </div>
    );
  }
}

export default MinervaImageView;
