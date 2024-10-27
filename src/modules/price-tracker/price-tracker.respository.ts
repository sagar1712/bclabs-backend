import { getManyBy, getSingleBy } from 'src/helpers';
import { Alerts } from './price-tracker.entity';

export const getAlertBy = getSingleBy(Alerts);
export const getAlertsBy = getManyBy(Alerts);
