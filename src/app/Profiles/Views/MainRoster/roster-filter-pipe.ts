import { Pipe, PipeTransform } from '@angular/core';
import { SectionUserProfile } from '../../Providers/profiles.model';

@Pipe({
    name: 'rosterfilter',
    pure: false
})
export class RosterFilterPipe implements PipeTransform {
    transform(profiles: SectionUserProfile[], filter: any): any {
        if (!profiles || !filter || !filter.text) {
            return profiles.slice(0, filter.size);
        }
        // filter items array, items which match and return true will be
        // kept, false will be filtered out
        const returnSet = profiles.filter(
            loopedProfile => {
                return Object.keys(loopedProfile).some(
                    loopedProp => {
                        if (loopedProfile[loopedProp] && typeof loopedProfile[loopedProp] == 'string') {
                            if (loopedProfile[loopedProp].toLowerCase().includes(filter.text.toLowerCase())) {
                                return loopedProfile;
                            }
                        }
                    });
            });

        return returnSet.slice(0, filter.size);
    }
}