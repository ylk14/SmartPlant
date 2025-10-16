import React, {useMemo, useState} from 'react';
import {View, Text, TextInput, FlatList, Image, Pressable, StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';

const MOCK = [
  // …reuse the same objects you used for ProfileScreen mock data
];

export default function SearchScreen() {
  const nav = useNavigation();
  const [q, setQ] = useState('');
  const [endangered, setEndangered] = useState(false);
  const [minConf, setMinConf] = useState(0);
  const [flagged, setFlagged] = useState(false);
  const [sort, setSort] = useState('new'); // 'new' | 'old' | 'conf' | 'az'

  const data = useMemo(() => {
    let list = MOCK.slice();

    // text match against species/common name
    const term = q.trim().toLowerCase();
    if (term) {
      list = list.filter(
        i =>
          i.speciesName.toLowerCase().includes(term) ||
          (i.commonName || '').toLowerCase().includes(term)
      );
    }
    if (endangered) list = list.filter(i => i.isEndangered);
    if (flagged) list = list.filter(i => i.flagged === true);
    if (minConf > 0) list = list.filter(i => (i.confidence || 0) >= minConf);

    switch (sort) {
      case 'old': list.sort((a,b)=>+new Date(a.createdAt)-+new Date(b.createdAt)); break;
      case 'conf': list.sort((a,b)=>(b.confidence||0)-(a.confidence||0)); break;
      case 'az': list.sort((a,b)=>a.speciesName.localeCompare(b.speciesName)); break;
      default: list.sort((a,b)=>+new Date(b.createdAt)-+new Date(a.createdAt));
    }
    return list;
  }, [q, endangered, minConf, flagged, sort]);

  const renderItem = ({item}) => (
    <Pressable
      onPress={() => nav.navigate('ObservationDetail', {...item})}
      style={s.card}
      android_ripple={{color:'#00000014'}}
    >
      <Image source={{uri: item.photoUri}} style={s.img}/>
      <View style={{flex:1}}>
        <Text numberOfLines={1} style={s.title}>{item.speciesName}</Text>
        <Text style={s.meta}>
          {new Date(item.createdAt).toLocaleString()} • {Math.round(item.confidence)}%
        </Text>
        {item.isEndangered ? <Text style={s.tag}>Endangered</Text> : null}
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={s.container} edges={['top','left','right']}>
      <View style={s.row}>
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Search species or common name"
          style={s.input}
        />
        {/* quick toggles can be your own pill buttons */}
      </View>

      {/* simple filter row for demo */}
      <View style={s.filters}>
        <Pressable style={[s.chip, endangered && s.chipOn]} onPress={()=>setEndangered(v=>!v)}>
          <Text style={[s.chipTxt, endangered && s.chipTxtOn]}>Endangered</Text>
        </Pressable>
        <Pressable style={[s.chip, flagged && s.chipOn]} onPress={()=>setFlagged(v=>!v)}>
          <Text style={[s.chipTxt, flagged && s.chipTxtOn]}>Flagged</Text>
        </Pressable>
        <Pressable style={s.chip} onPress={()=>setMinConf(minConf===60?0:60)}>
          <Text style={[s.chipTxt, minConf===60 && s.chipTxtOn]}>
            {minConf===60?'≥60% on':'≥60%'}
          </Text>
        </Pressable>
      </View>

      <FlatList
        data={data}
        keyExtractor={i=>i.id}
        renderItem={renderItem}
        contentContainerStyle={{padding:16, paddingBottom:24}}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container:{flex:1, backgroundColor:'#F7F9F6'},
  row:{flexDirection:'row', padding:16, paddingBottom:8},
  input:{flex:1, backgroundColor:'#fff', borderRadius:12, paddingHorizontal:12, height:44},
  filters:{flexDirection:'row', flexWrap:'wrap', paddingHorizontal:16, gap:8},
  chip:{paddingHorizontal:10, height:30, borderRadius:15, backgroundColor:'#e7efe9', justifyContent:'center'},
  chipOn:{backgroundColor:'#93C3A0'},
  chipTxt:{color:'#335a44', fontWeight:'700'},
  chipTxtOn:{color:'#fff'},
  card:{flexDirection:'row', gap:12, backgroundColor:'#fff', padding:10, borderRadius:12, marginTop:12},
  img:{width:84, height:84, borderRadius:10, backgroundColor:'#ddd'},
  title:{fontWeight:'800', color:'#2b2b2b'},
  meta:{color:'#666', marginTop:4},
  tag:{marginTop:6, color:'#8b2f2f', fontWeight:'700'}
});

