import * as fs from 'fs'
import * as os from 'os'
import { fromIni }  from '@aws-sdk/credential-provider-ini'
import { Credentials, Provider } from '@aws-sdk/types'

export class AwsProfile {
  name: string

  constructor(name: string) {
    this.name = name
  }

  getCredentials(): Provider<Credentials> {
    return fromIni({ profile: this.name })
  }
}

export default class AwsCredentials {
  filePath: string
  profiles: AwsProfile[]
  currentProfile: AwsProfile

  constructor(filePath: string) {
    this.filePath = filePath
  }

  /**
   * Load profiles from credentials file
   */
  async loadProfiles(): Promise<AwsProfile[]> {

    // Check if credentials file exist
    if (fs.existsSync(this.filePath) === false) {
      throw 'Cannot find credentials file'
    }

    // Load credentials file content
    const content = fs.readFileSync(this.filePath).toString('utf8')

    // Split by rows
    const rows = content.split(os.EOL)

    // Loop for each row
    const profiles = []
    let profileIteration = null
    for (const row of rows) {

      // Check if row is an header
      const headerMatch = row.match('^\\[(.*)\\]$')
      if (headerMatch !== null && headerMatch[1]) {

        // Check if profile creation is in progress
        if (profileIteration != null) {

          // Store profile and clean iteration variable
          profiles.push(profileIteration)
          profileIteration = null
        }

        // Create new profile and jump to the next row
        profileIteration = new AwsProfile(headerMatch[1].trim())
        continue
      }

      // If row does not match header or value skip
    }

    // Check if last profileIteration is in progress
    if (profileIteration != null) {
      profiles.push(profileIteration)
      profileIteration = null
    }

    // Store all founded profiles
    this.profiles = profiles

    // Return only profiles names
    return this.profiles
  }

  /**
   * Get all loaded profiles
   */
  getAllProfiles(): AwsProfile[] {
    return this.profiles
  }

  /**
   * Get project by name
   */
  getProfileByName(name: string): AwsProfile|undefined {
    return this.profiles.find(profile => {
      return profile.name === name
    })
  }
}

export const REGIONS = {
  'us-east-1'     :   'US East (N. Virginia)',
  'us-east-2'     :   'US East (Ohio)',
  'us-west-1'     :   'US West (N. California)',
  'us-west-2'     :   'US West (Oregon)',
  'ap-south-2'    :   'Asia Pacific (Hyderabad)',
  'ap-south-1'    :   'Asia Pacific (Mumbai)',
  'eu-south-1'    :   'Europe (Milan)',
  'eu-south-2'    :   'Europe (Spain)',
  'me-central-1'  :   'Middle East (UAE)',
  'il-central-1'  :   'Israel (Tel Aviv)',
  'ca-central-1'  :   'Canada (Central)',
  'eu-central-1'  :   'Europe (Frankfurt)',
  'eu-central-2'  :   'Europe (Zurich)',
  'af-south-1'    :   'Africa (Cape Town)',
  'eu-north-1'    :   'Europe (Stockholm)',
  'eu-west-3'     :   'Europe (Paris)',
  'eu-west-2'     :   'Europe (London)',
  'eu-west-1'     :   'Europe (Ireland)',
  'ap-northeast-3':   'Asia Pacific (Osaka)',
  'ap-northeast-2':   'Asia Pacific (Seoul)',
  'me-south-1'    :   'Middle East (Bahrain)',
  'ap-northeast-1':   'Asia Pacific (Tokyo)',
  'sa-east-1'     :   'South America (Sao Paulo)',
  'ap-east-1'     :   'Asia Pacific (Hong Kong)',
  'ca-west-1'     :   'Canada West (Calgary)',
  'ap-southeast-1':   'Asia Pacific (Singapore)',
  'ap-southeast-2':   'Asia Pacific (Sydney)',
  'ap-southeast-3':   'Asia Pacific (Jakarta)',
  'ap-southeast-4':   'Asia Pacific (Melbourne)'
}
