// src/utils/getIconComponent.ts
/**
 * Icon Component Utilities
 * 
 * This file provides functionality for dynamically retrieving Material-UI
 * icon components by name. Maps icon name strings to actual icon components
 * with fallback support.
 */
import React from 'react';
import { SvgIconProps } from '@mui/material/SvgIcon';
import ScienceIcon from '@mui/icons-material/Science';
import CalculateIcon from '@mui/icons-material/Calculate';
import BoltIcon from '@mui/icons-material/Bolt';
import BiotechIcon from '@mui/icons-material/Biotech';
import SchoolIcon from '@mui/icons-material/School';
import PublicIcon from '@mui/icons-material/Public';
import DefaultIcon from '@mui/icons-material/Category'; // A fallback icon

/**
 * Icon Map
 * 
 * Maps icon name strings to their corresponding Material-UI icon components.
 * Add new icons here as needed to support additional icon types.
 */
const iconMap: Record<string, React.ComponentType<SvgIconProps>> = {
  ScienceIcon: ScienceIcon,
  CalculateIcon: CalculateIcon,
  BoltIcon: BoltIcon,
  BiotechIcon: BiotechIcon,
  SchoolIcon: SchoolIcon,
  PublicIcon: PublicIcon,
  // Add other icons here as needed
};

/**
 * Get Icon Component
 * 
 * Retrieves a Material-UI icon component by name. Returns the DefaultIcon
 * if the requested icon name is not found in the icon map.
 * 
 * @param {string} iconName - Name of the icon to retrieve (e.g., 'ScienceIcon')
 * @returns {React.ComponentType<SvgIconProps>} Icon component or DefaultIcon fallback
 */
export function getIconComponent(iconName: string): React.ComponentType<SvgIconProps> {
  const IconComponent = iconMap[iconName];
  return IconComponent || DefaultIcon; // Return DefaultIcon if not found
}