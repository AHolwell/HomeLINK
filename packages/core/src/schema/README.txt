These are the schema for all the supported devices.
Each device category has their fields, updatable fields and any limits defined here.

Updatable fields are the ones we want to allow to be changed by the update endpoint.

To support a new device you simply need add its schema, an entry to the mappers, and an export in index.
All new devices should extend the BaseDevice