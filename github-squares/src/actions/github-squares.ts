import streamDeck, { action, KeyDownEvent, SingletonAction, WillAppearEvent } from "@elgato/streamdeck";
import {GithubSquaresSettings} from "../types/index";


@action({ UUID: "com.alexis-montes.github-squares.squares" })
export class GithubSquare extends SingletonAction<GithubSquaresSettings> {

	override onWillAppear(ev: WillAppearEvent<GithubSquaresSettings>): void | Promise<void> {
		const { settings } = ev.payload;
		
		streamDeck.logger.info('onKeyDown settings:', settings);
	}

	override async onKeyDown(ev: KeyDownEvent<GithubSquaresSettings>): Promise<void> {
		// Update the count from the settings.
		const { settings } = ev.payload;
		
		streamDeck.logger.info(`Key pressed!`);
	}
}
