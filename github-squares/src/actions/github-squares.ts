import 
	streamDeck, 
	{ action, KeyDownEvent, SingletonAction, WillAppearEvent, DidReceiveSettingsEvent } 
from "@elgato/streamdeck";
import {
	GithubSquaresSettings, 
	ContributionCalendar,
	ContributionDays,
} from "../types/index";
import { fetchContributions, findTheCorrectDay } from "../utils/github";


@action({ UUID: "com.alexis-montes.github-squares.squares" })
export class GithubSquare extends SingletonAction<GithubSquaresSettings> {

	private async fetchIfValid(settings: GithubSquaresSettings, ev?: WillAppearEvent<GithubSquaresSettings> | DidReceiveSettingsEvent<GithubSquaresSettings> | KeyDownEvent<GithubSquaresSettings>): Promise<void> {
		try {
			// Get the access token from global settings
			const globalSettings = await streamDeck.settings.getGlobalSettings<{ accessToken?: string }>();
			const token = globalSettings?.accessToken || settings.accessToken;
			const daysBack = Number(settings.daysBack);
			
			if (token && settings.username && !isNaN(daysBack)) {
				const contributions: ContributionCalendar = await fetchContributions(settings.username, token, daysBack);
				const today: ContributionDays = findTheCorrectDay(contributions, daysBack);

				if (today) {
					const color = today.color || '#ebedf0';
					const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="144" height="144">
						<rect width="144" height="144" fill="${color}"/>
					</svg>`;
					const svgBase64 = Buffer.from(svg).toString('base64');
					ev?.action.setImage(`data:image/svg+xml;base64,${svgBase64}`);
				} else {
					streamDeck.logger.warn('No contribution data for today found.');
				}
			} else {
				streamDeck.logger.warn('Missing token, username, or invalid daysBack - skipping fetch');
			}
		} catch (error) {
			streamDeck.logger.error('Error fetching contributions:', error);
		}
	}

	override async onWillAppear(ev: WillAppearEvent<GithubSquaresSettings>): Promise<void> {
		const { settings } = ev.payload;

		// set icon to be a grey square while loading or if settings are incomplete
		const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="144" height="144">
			<rect width="144" height="144" fill="#8a8a8a"/>
		</svg>`;
		
		const svgBase64 = Buffer.from(svg).toString('base64');
		ev.action.setImage(`data:image/svg+xml;base64,${svgBase64}`);
		
		// If there's no accessToken in settings but one exists in global settings, add it (make it easier for users)
		if (!settings.accessToken) {
			const globalSettings = await streamDeck.settings.getGlobalSettings<{ accessToken?: string }>();
			if (globalSettings?.accessToken) {
				const updatedSettings = {
					...settings,
					accessToken: globalSettings.accessToken
				};
				await ev.action.setSettings(updatedSettings);
			}
		}
		
		await this.fetchIfValid(settings, ev);
	}

	override async onDidReceiveSettings(ev: DidReceiveSettingsEvent<GithubSquaresSettings>): Promise<void> {
		const { settings } = ev.payload;
		
		if (settings.accessToken) {
			await streamDeck.settings.setGlobalSettings({ accessToken: settings.accessToken });
		}

		await this.fetchIfValid(settings, ev);
	}

	override async onKeyDown(ev: KeyDownEvent<GithubSquaresSettings>): Promise<void> {
		const { settings } = ev.payload;
		await this.fetchIfValid(settings, ev);
	}
}
