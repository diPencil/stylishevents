const fs = require('fs');
let code = fs.readFileSync('frontend/app/admin/page.tsx', 'utf8');

code = code.replace(
`            )}
          </CardContent>
        </Card>
      </section>

            <div className="grid gap-4 lg:grid-cols-[360px_1fr]">`,
`            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_360px] items-start">
        <div className="space-y-6">
            <div className="grid gap-4 lg:grid-cols-[360px_1fr]">`
);

code = code.replace(
`            </div>

          <aside className="space-y-4">`,
`            </div>
        </div>

        <aside className="space-y-4">`
);

code = code.replace(
`              </CardContent>
            </Card>
          </aside>
    </div>
  )
}`,
`              </CardContent>
            </Card>
          </aside>
      </section>
    </div>
  )
}`
);

fs.writeFileSync('frontend/app/admin/page.tsx', code);
console.log('Fixed Grid');
