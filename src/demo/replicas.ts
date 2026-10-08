import { lazy } from 'react';
export const GeaWeb = lazy(() => import('./gea/GeaWebReplica'));
export const GeaPhone = lazy(() => import('./gea/GeaPhoneReplica'));
export const FarmWin = lazy(() => import('./farm/FarmReplica'));
export { geaWebScript } from './gea/geaWebScript';
export { geaPhoneScript } from './gea/geaPhoneScript';
export { farmScript } from './farm/farmScript';
