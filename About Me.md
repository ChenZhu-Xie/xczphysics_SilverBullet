
# Warm Robot: INTP-ah

The ultimate personality for both humanity & AI flows naturally in my soul: ${Yellow("INTP-a(d)h(d:)")}

## Where I am now ⛳
${embed_map("Qiushui Square","","400","18","k")}
${owm_widget()}

## Where I came from ⛳
${embed_map("Leshan Giant Buddha","","400","18","k")}
${getOWM("Leshan")}

## Time left 🌄

${timeLeftBar()}

# Some of My thoughts

${query[[
    from index.tag "page"
    where _.name:startsWith("Daydream/")
    select {ref = _.ref}
]]}
