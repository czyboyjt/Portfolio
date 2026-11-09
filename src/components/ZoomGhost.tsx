import React from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { Project } from '../types';
import { ProjectCardArtwork } from './ProjectCardArtwork';
import { ZOOM_EASE, heroVideoRegistry } from '../utils/stagePull';
import { isSplitWidth, splitLayout, stackedHero } from '../utils/caseStudyLayout';

export interface ZoomState {
  project: Project;
  rect: DOMRect; // where the clicked image sits on screen
  time: number; // playback position of its video at the click, if it has one
  at: number; // performance.now() at the click
  frame?: string | null; // a picture of the video at the click, shown under it while it loads
}

// The picture that grows from where it was clicked to fill the screen while the case study opens.
// Used by both the desktop stage and the phone cards.
export const ZoomGhost: React.FC<{ zoom: ZoomState }> = ({ zoom }) => {
  // Where the picture ends up: the video's place in the page's right column on wide screens,
  // otherwise the shorter picture across the top of the stacked page
  const vw = window.innerWidth;
  const to = isSplitWidth(vw) ? splitLayout(vw).hero : stackedHero(vw, window.innerHeight);
  return createPortal(
    <motion.div
      initial={{ left: zoom.rect.left, top: zoom.rect.top, width: zoom.rect.width, height: zoom.rect.height, opacity: 1 }}
      animate={{
        // a small dip first (the frame gathers itself), then a sharp launch to full screen
        left: [zoom.rect.left, zoom.rect.left + zoom.rect.width * 0.01, to.left],
        top: [zoom.rect.top, zoom.rect.top + zoom.rect.height * 0.01, to.top],
        // plain pixel numbers throughout: mixing px with vw units makes the size jump instead of blend
        width: [zoom.rect.width, zoom.rect.width * 0.98, to.width],
        height: [zoom.rect.height, zoom.rect.height * 0.98, to.height],
        opacity: [1, 1, 0],
      }}
      transition={{
        left: { duration: 0.85, times: [0, 0.1, 1], ease: ['easeOut', ZOOM_EASE] },
        top: { duration: 0.85, times: [0, 0.1, 1], ease: ['easeOut', ZOOM_EASE] },
        width: { duration: 0.85, times: [0, 0.1, 1], ease: ['easeOut', ZOOM_EASE] },
        height: { duration: 0.85, times: [0, 0.1, 1], ease: ['easeOut', ZOOM_EASE] },
        opacity: { duration: 1.3, times: [0, 0.72, 1] },
      }}
      className="fixed z-[60] overflow-hidden pointer-events-none"
    >
      {/* the picture keeps pushing forward inside the growing frame; the page then settles it back */}
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1 }}
        animate={{ scale: 1.06 }}
        transition={{ duration: 0.85, ease: ZOOM_EASE }}
      >
        {zoom.frame ? (
          <img src={zoom.frame} alt="" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <ProjectCardArtwork project={zoom.project} slot="topRight" hideLabel />
        )}
        {zoom.project.heroVideo && (
          <video
            ref={(el) => {
              heroVideoRegistry.ghost = el;
            }}
            src={zoom.project.heroVideo}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            onLoadedMetadata={(e) => {
              // carry on from where the card's video was
              e.currentTarget.currentTime = zoom.time + (performance.now() - zoom.at) / 1000;
            }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
      </motion.div>
    </motion.div>,
    document.body
  );
};
