import React from 'react';
import { motion } from 'framer-motion';

const RemoteCursor = ({ name, color, x, y }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{
        opacity: 1,
        scale: 1,
        x: x,
        y: y,
      }}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={{
        type: 'spring',
        damping: 30,
        stiffness: 300,
        opacity: { duration: 0.2 },
      }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 1000,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
      }}
    >
      {/* Cursor Bar */}
      <div
        style={{
          width: '2px',
          height: '20px',
          backgroundColor: color,
          boxShadow: `0 0 8px ${color}`,
        }}
      />

      {/* Name Badge */}
      <motion.div
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{
          backgroundColor: color,
          color: 'white',
          padding: '2px 8px',
          borderRadius: '4px',
          fontSize: '10px',
          fontWeight: 'bold',
          whiteSpace: 'nowrap',
          marginTop: '2px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          border: '1px solid rgba(255,255,255,0.2)',
        }}
      >
        {name}
      </motion.div>
    </motion.div>
  );
};

export default RemoteCursor;
