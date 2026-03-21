/** Citation to an official or primary document (Service-Public, CAF, impots.gouv, etc.). */
export type SourceRef = {
  readonly id: string;
  readonly title: string;
  readonly url: string;
};
