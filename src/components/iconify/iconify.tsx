import { forwardRef } from 'react';
import { Icon} from '@iconify/react';
import Box, { BoxProps } from '@mui/material/Box';
import PropTypes from 'prop-types';

interface IconifyProps extends BoxProps {
  icon: string;
  width?: number;
}

const Iconify = forwardRef<HTMLElement, IconifyProps>(({ icon, width = 20, sx, ...other }, ref) => (
  <Box
    ref={ref}
    component={Icon}
    className="component-iconify"
    icon={icon}
    sx={{ width, height: width, ...sx }}
    {...other}
  />
));

Iconify.propTypes = {
  icon: PropTypes.string.isRequired,
  sx: PropTypes.object,
  width: PropTypes.number,
};

export default Iconify;
