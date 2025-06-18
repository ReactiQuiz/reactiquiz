// src/utils/getIconComponent.js
import ScienceIcon from '@mui/icons-material/Science';
import CalculateIcon from '@mui/icons-material/Calculate';
import BoltIcon from '@mui/icons-material/Bolt';
import BiotechIcon from '@mui/icons-material/Biotech';
import SchoolIcon from '@mui/icons-material/School';
import PublicIcon from '@mui/icons-material/Public';
import DefaultIcon from '@mui/icons-material/Category'; // A fallback icon

const iconMap = {
  ScienceIcon: ScienceIcon,
  CalculateIcon: CalculateIcon,
  BoltIcon: BoltIcon,
  BiotechIcon: BiotechIcon,
  SchoolIcon: SchoolIcon,
  PublicIcon: PublicIcon,
  // Add other icons here as needed
};

export function getIconComponent(iconName) {
  const IconComponent = iconMap[iconName];
  return IconComponent || DefaultIcon; // Return DefaultIcon if not found
}