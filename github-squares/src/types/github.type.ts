
export type ContributionDays = {
	date: string;
	contributionCount: number;
	color: string;
}

export type ContributionWeek = {
	contributionDays: ContributionDays[];
}

export type ContributionCalendar = {
	totalContributions: number;
	weeks: ContributionWeek[];
}

export type ContributionsCollection = {
	contributionCalendar: ContributionCalendar;
}

export type UserContributions = {
	user: {
		contributionsCollection: ContributionsCollection;
	};
}