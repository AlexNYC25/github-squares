import 
	streamDeck, 
	{ action, KeyDownEvent, SingletonAction, WillAppearEvent, DidReceiveSettingsEvent } 
from "@elgato/streamdeck";
import {
	GithubSquaresSettings, 
	ContributionCalendar
} from "../types/index";
import { fetchContributions } from "../utils/github";


@action({ UUID: "com.alexis-montes.github-squares.squares" })
export class GithubSquare extends SingletonAction<GithubSquaresSettings> {

	private async fetchIfValid(settings: GithubSquaresSettings): Promise<void> {
		try {
			// Get the access token from global settings
			const globalSettings = await streamDeck.settings.getGlobalSettings<{ accessToken?: string }>();
			const token = globalSettings?.accessToken || settings.accessToken;
			const daysBack = Number(settings.daysBack);
			streamDeck.logger.info('Token available:', !!token, 'Username available:', !!settings.username, 'DaysBack valid:', !isNaN(daysBack));
			
			if (token && settings.username && !isNaN(daysBack)) {
				const contributions: ContributionCalendar = await fetchContributions(settings.username, token, daysBack);
				streamDeck.logger.info('Fetched contributions:', contributions);
			} else {
				streamDeck.logger.warn('Missing token, username, or invalid daysBack - skipping fetch');
			}
		} catch (error) {
			streamDeck.logger.error('Error fetching contributions:', error);
		}
	}

	override async onWillAppear(ev: WillAppearEvent<GithubSquaresSettings>): Promise<void> {
		const { settings } = ev.payload;

		// set icon to be a grey square while loading
		const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="144" height="144">
			<rect width="144" height="144" fill="#8a8a8a"/>
		</svg>`;
		
		const svgBase64 = Buffer.from(svg).toString('base64');
		ev.action.setImage(`data:image/svg+xml;base64,${svgBase64}`);
		
		// If there's no accessToken in settings but one exists in global settings, add it
		if (!settings.accessToken) {
			const globalSettings = await streamDeck.settings.getGlobalSettings<{ accessToken?: string }>();
			if (globalSettings?.accessToken) {
				const updatedSettings = {
					...settings,
					accessToken: globalSettings.accessToken
				};
				await streamDeck.settings.setGlobalSettings(updatedSettings);
			}
		}
		
		await this.fetchIfValid(settings);
	}

	override async onDidReceiveSettings(ev: DidReceiveSettingsEvent<GithubSquaresSettings>): Promise<void> {
		const { settings } = ev.payload;
		
		// Update global settings with the new AccessToken
		if (settings.accessToken) {
			await streamDeck.settings.setGlobalSettings({ accessToken: settings.accessToken });
		}

		// Fetch contributions when settings change
		await this.fetchIfValid(settings);
	}

	override async onKeyDown(ev: KeyDownEvent<GithubSquaresSettings>): Promise<void> {
		const { settings } = ev.payload;
		await this.fetchIfValid(settings);
	}
}
