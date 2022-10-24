function HelloWorld(props) {
  return (
    <Page>
      <TextInput label="心拍数データの保持期間[分]" placeholder="例：600" settingsKey="retentionPeriod" type="number"/>
      <TextInput label="高リラックス状態の閾値" placeholder="例：1.2" settingsKey="thresholdHigh" type="number"/>
      <TextInput label="低リラックス状態の閾値" placeholder="例：0.8" settingsKey="thresholdLow" type="number"/>
      <Toggle settingsKey="sendHttp" label="低リラックス検出時のHTTPリクエスト送信"/>
      <TextInput label="HTTPリクエストのURL" placeholder="例：https://example.com/api" settingsKey="sendUrl" type="url" disabled={!(props.settings.sendHttp === 'true')}/>
    </Page>
  );
}

registerSettingsPage(HelloWorld);
